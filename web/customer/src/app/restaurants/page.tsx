'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Search,
  ArrowLeft,
  Star,
  Clock,
  Bike,
  ChevronRight
} from 'lucide-react';
import { PremiumCard } from '@/components/shared/PremiumCard';
import { PremiumButton } from '@/components/shared/PremiumButton';
import { useRestaurants } from '@/hooks/useRestaurants';
import { LoadingState } from '@/components/shared/LoadingState';
import { ErrorState } from '@/components/shared/ErrorState';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export default function RestaurantsPage() {
  const [search, setSearch] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  
  const { restaurants, isLoading, isError } = useRestaurants();

  const filters = ['all', 'popular', 'new', 'rating', 'fastest', 'cheapest'];

  const filteredRestaurants = useMemo(() => {
    return restaurants.filter(r => {
      // Filter by search
      const matchesSearch = search === '' || 
        r.name.toLowerCase().includes(search.toLowerCase()) || 
        r.category.toLowerCase().includes(search.toLowerCase());
      
      if (!matchesSearch) return false;

      // Filter by badge/filter
      if (selectedFilter === 'all') return true;
      if (selectedFilter === 'popular') return r.badge === 'Popular';
      if (selectedFilter === 'new') return r.badge === 'New';
      if (selectedFilter === 'rating') return r.rating >= 4.7;
      if (selectedFilter === 'fastest') return parseInt(r.deliveryTime) <= 20;
      if (selectedFilter === 'cheapest') return r.deliveryFee <= 2.0;
      
      return true;
    });
  }, [restaurants, search, selectedFilter]);

  if (isError) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 pb-12 flex items-center justify-center p-4">
        <ErrorState
          title="Failed to load restaurants"
          message="We couldn't load the restaurant list. Please try again."
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="flex items-center gap-4 mb-6">
            <Link href="/">
              <PremiumButton variant="ghost" icon={<ArrowLeft size={20} />}>
                Back
              </PremiumButton>
            </Link>
            <h1 className="text-3xl md:text-4xl font-black text-text-primary">All Restaurants</h1>
          </div>

          {/* Search */}
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-tertiary w-5 h-5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search restaurants..."
              className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-gray-200 bg-white text-text-primary placeholder-text-tertiary focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-100"
            />
          </div>

          {/* Filters */}
          <div className="flex items-center gap-3 overflow-x-auto pb-3">
            {filters.map((filter) => (
              <button
                key={filter}
                onClick={() => setSelectedFilter(filter)}
                className={`px-4 py-2 rounded-full font-semibold whitespace-nowrap transition-all capitalize ${
                  selectedFilter === filter
                    ? 'bg-primary-600 text-white'
                    : 'bg-white text-text-secondary border border-gray-200 hover:border-primary-300'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Results */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-elevation-1">
                <div className="h-40 bg-gray-200 animate-pulse"></div>
                <div className="p-5 space-y-4">
                  <div className="h-5 bg-gray-200 animate-pulse rounded"></div>
                  <div className="h-4 bg-gray-200 animate-pulse rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 animate-pulse rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredRestaurants.length > 0 ? (
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredRestaurants.map((restaurant) => (
              <motion.div key={restaurant.id} variants={item}>
                <Link href={`/shop/${restaurant.id}`}>
                  <PremiumCard variant="elevated" hoverable>
                    <div className="overflow-hidden">
                      {/* Image */}
                      <div className="h-40 bg-gradient-to-br from-primary-100 to-accent-100 relative overflow-hidden flex items-center justify-center group">
                        {restaurant.imageUrl ? (
                          <img 
                            src={restaurant.imageUrl} 
                            alt={restaurant.name} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="text-5xl group-hover:scale-125 transition-transform duration-500">
                            🍽️
                          </div>
                        )}
                        
                        {/* Badge */}
                        {restaurant.badge && (
                          <div className="absolute top-3 left-3">
                            <span className="inline-flex items-center bg-primary-600 text-white px-3 py-1 rounded-full text-xs font-bold">
                              {restaurant.badge}
                            </span>
                          </div>
                        )}

                        {/* Discount */}
                        {restaurant.discount && (
                          <div className="absolute top-3 right-3 bg-error-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                            {restaurant.discount}
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="p-5 space-y-4">
                        <div>
                          <h3 className="text-lg font-bold text-text-primary mb-1">{restaurant.name}</h3>
                          <p className="text-sm text-text-secondary font-medium">{restaurant.category}</p>
                        </div>

                        {/* Rating */}
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1 bg-primary-50 px-3 py-1.5 rounded-lg">
                            <Star size={14} className="text-primary-600 fill-primary-600" />
                            <span className="text-sm font-bold text-primary-600">{restaurant.rating}</span>
                            <span className="text-xs text-text-tertiary">({restaurant.reviewCount})</span>
                          </div>
                        </div>

                        {/* Tags */}
                        {restaurant.tags && restaurant.tags.length > 0 && (
                          <div className="flex gap-2 flex-wrap">
                            {restaurant.tags.slice(0, 2).map((tag) => (
                              <span key={tag} className="text-xs bg-gray-100 text-text-secondary px-2 py-1 rounded-full">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Delivery Info */}
                        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                          <div className="flex items-center gap-4 text-sm font-semibold text-text-secondary">
                            <span className="flex items-center gap-1">
                              <Clock size={16} className="text-primary-600" /> {restaurant.deliveryTime}
                            </span>
                            <span className="flex items-center gap-1">
                              <Bike size={16} className="text-primary-600" /> ${restaurant.deliveryFee.toFixed(2)}
                            </span>
                          </div>
                          <ChevronRight size={18} className="text-text-tertiary" />
                        </div>
                      </div>
                    </div>
                  </PremiumCard>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <PremiumCard variant="elevated" className="p-12 text-center">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-bold text-text-primary mb-2">No restaurants found</h3>
            <p className="text-text-secondary">Try adjusting your search or filters</p>
          </PremiumCard>
        )}
      </div>
    </div>
  );
}

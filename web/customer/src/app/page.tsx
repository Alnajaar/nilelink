"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ShoppingBag,
  Search,
  ArrowRight,
  Star,
  Clock,
  Bike,
  Flame,
  TrendingUp,
  MapPin,
  ChevronRight
} from 'lucide-react';
import { DemandPulse } from '@/components/DemandPulse';
import { PremiumCard } from '@/components/shared/PremiumCard';
import { PremiumButton } from '@/components/shared/PremiumButton';
import { useRestaurants } from '@/hooks/useRestaurants';
import { AIFlashDeal } from '@/components/AIFlashDeal';
import AuthGuard from '@shared/components/AuthGuard';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

export default function DiscoveryPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const { restaurants, isLoading: restaurantsLoading } = useRestaurants();

  // Filter featured/popular restaurants
  const mockRestaurants = restaurants.filter(r => r.badge === 'Popular' || r.badge === 'Trending').slice(0, 6);

  const categories = [
    { id: 1, name: 'Fast Food', icon: '🍔' },
    { id: 2, name: 'Pizza', icon: '🍕' },
    { id: 3, name: 'Asian', icon: '🥡' },
    { id: 4, name: 'Healthy', icon: '🥗' },
    { id: 5, name: 'Desserts', icon: '🍰' },
    { id: 6, name: 'Drinks', icon: '🧃' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <DemandPulse />

      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="relative py-16 md:py-24 px-4 md:px-0"
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-text-primary mb-6 leading-tight">
                Discover Food,
                <span className="text-gradient block mt-2">Order with Confidence</span>
              </h1>
              <p className="text-lg text-text-secondary mb-8 max-w-2xl mx-auto">
                The most advanced food discovery and ordering platform in the NileLink ecosystem. Real-time delivery tracking, verified merchants, and seamless payments.
              </p>
            </motion.div>
          </div>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="max-w-2xl mx-auto mb-12"
          >
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-tertiary w-5 h-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="What are you craving today?"
                className="w-full pl-12 pr-6 py-4 rounded-2xl border-2 border-gray-200 bg-white text-text-primary placeholder-text-tertiary focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-100 transition-all shadow-md"
              />
              <PremiumButton
                variant="primary"
                size="sm"
                className="absolute right-2 top-1/2 -translate-y-1/2"
              >
                <Search size={18} />
              </PremiumButton>
            </div>
          </motion.div>

          {/* Featured Categories */}
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-3 md:grid-cols-6 gap-4 mb-12"
          >
            {categories.map((category) => (
              <motion.button
                key={category.id}
                variants={item}
                className="group flex flex-col items-center gap-3 p-4 rounded-2xl hover:bg-white transition-all duration-300 shadow-sm hover:shadow-md"
              >
                <div className="text-4xl group-hover:scale-110 transition-transform duration-300">
                  {category.icon}
                </div>
                <span className="text-xs font-bold text-text-secondary group-hover:text-text-primary transition-colors text-center">
                  {category.name}
                </span>
              </motion.button>
            ))}
          </motion.div>
        </div>
      </motion.div>

      {/* AI-Powered Featured Promo */}
      <AIFlashDeal onDealClick={() => console.log('Deal clicked')} />

      {/* Restaurants Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="max-w-6xl mx-auto px-4 pb-24"
      >
        <div className="mb-12">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-black text-text-primary mb-2">Nearby Restaurants</h2>
              <p className="text-text-secondary">Discover top-rated merchants near you</p>
            </div>
            <Link href="/restaurants" className="flex items-center gap-2 text-primary-600 hover:text-primary-700 font-bold">
              View All <ChevronRight size={20} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {restaurantsLoading ? (
              [1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-elevation-1">
                  <div className="h-40 bg-gray-200 animate-pulse"></div>
                  <div className="p-5 space-y-4">
                    <div className="h-5 bg-gray-200 animate-pulse rounded"></div>
                    <div className="h-4 bg-gray-200 animate-pulse rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 animate-pulse rounded w-1/2"></div>
                  </div>
                </div>
              ))
            ) : mockRestaurants.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <p className="text-text-secondary">No restaurants available at the moment</p>
              </div>
            ) : mockRestaurants.map((restaurant, idx) => (
              <motion.div
                key={restaurant.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
              >
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
                          <div className="text-6xl group-hover:scale-125 transition-transform duration-500">
                            🍽️
                          </div>
                        )}

                        {/* Badge */}
                        {restaurant.badge && (
                          <div className="absolute top-4 left-4">
                            <span className="inline-flex items-center gap-1 bg-primary-600 text-white px-3 py-1 rounded-full text-xs font-bold">
                              {restaurant.badge === 'Popular' && <TrendingUp size={12} />}
                              {restaurant.badge === 'Trending' && <Flame size={12} />}
                              {restaurant.badge}
                            </span>
                          </div>
                        )}

                        {/* Loyalty Bonus */}
                        {restaurant.loyaltyBonus && (
                          <div className="absolute top-4 right-4 bg-error-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                            +{restaurant.loyaltyBonus} pts
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="p-5 space-y-4">
                        <div>
                          <h3 className="text-lg font-bold text-text-primary mb-1">{restaurant.name}</h3>
                          <p className="text-sm text-text-secondary font-medium">{restaurant.category}</p>
                        </div>

                        {/* Rating & Stats */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1 bg-primary-50 px-2.5 py-1 rounded-lg">
                              <Star size={14} className="text-primary-600 fill-primary-600" />
                              <span className="text-sm font-bold text-primary-600">{restaurant.rating}</span>
                              <span className="text-xs text-text-tertiary">({restaurant.reviewCount})</span>
                            </div>
                          </div>
                        </div>

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
                          <ArrowRight size={18} className="text-primary-600" />
                        </div>
                      </div>
                    </div>
                  </PremiumCard>
                </Link>
              </motion.div>
            ))
            }
          </div>
        </div>
      </motion.div>

      {/* Mobile CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        className="fixed bottom-6 left-6 right-6 md:hidden z-40"
      >
        <Link href="/checkout">
          <PremiumButton
            variant="primary"
            size="lg"
            fullWidth
            icon={<ShoppingBag size={20} />}
          >
            View Cart
          </PremiumButton>
        </Link>
      </motion.div>
    </div>
  );
}

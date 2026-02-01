/**
 * Enhanced Flash Deals Component - Decentralized Data
 * 
 * Features:
 * - Fetches deals from The Graph subgraph
 * - Loads menu details from IPFS
 * - Real-time inventory tracking
 * - Time-based expiration countdown
 */

"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Clock, TrendingDown, Zap, ShoppingCart, AlertCircle } from 'lucide-react';
import { useFlashDeals, getRealTimeInventory } from '@/hooks/useFlashDeals';
import { useAccount } from 'wagmi';
import { useRouter } from 'next/navigation';

export const AIFlashDeal = () => {
  const { deals, isLoading, error } = useFlashDeals();
  const { address, isConnected } = useAccount();
  const router = useRouter();
  const [selectedDeal, setSelectedDeal] = useState<any>(null);

  // Select best deal based on discount and time remaining
  useEffect(() => {
    if (deals.length > 0) {
      // Prioritize high discount deals with decent time remaining
      const bestDeal = deals.reduce((best, current) => {
        const score = (current.discount * 0.7) + (Math.min(current.hoursRemaining, 24) * 0.3);
        const bestScore = (best.discount * 0.7) + (Math.min(best.hoursRemaining, 24) * 0.3);
        return score > bestScore ? current : best;
      }, deals[0]);

      setSelectedDeal(bestDeal);
    }
  }, [deals]);

  const handleClaimDeal = async () => {
    if (!isConnected) {
      // Redirect to connect wallet
      router.push('/auth/login');
      return;
    }

    if (!selectedDeal) return;

    try {
      // Check real-time inventory before allowing claim
      const inventory = await getRealTimeInventory(selectedDeal.id);

      if (inventory <= 0) {
        alert('Sorry, this deal is sold out!');
        return;
      }

      // Navigate to restaurant with deal applied
      router.push(`/shop/${selectedDeal.restaurantId}?deal=${selectedDeal.id}`);
    } catch (error) {
      console.error('Error claiming deal:', error);
      alert('Failed to claim deal. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="bg-gradient-to-br from-accent-400 via-accent-500 to-accent-600 rounded-3xl p-8 text-white">
        <div className="flex items-center justify-center gap-3">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          >
            <Zap size={24} />
          </motion.div>
          <p className="font-bold">Loading flash deals...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-100 rounded-3xl p-8">
        <div className="flex items-center gap-3 text-gray-600">
          <AlertCircle size={24} />
          <p className="font-medium">Unable to load deals. Please try again later.</p>
        </div>
      </div>
    );
  }

  if (!selectedDeal) {
    return (
      <div className="bg-gradient-to-br from-primary-400 via-primary-500 to-primary-600 rounded-3xl p-8 text-white">
        <div className="text-center">
          <Flame size={48} className="mx-auto mb-4 opacity-50" />
          <p className="font-bold text-lg">No active flash deals right now</p>
          <p className="text-sm text-primary-100 mt-2">Check back soon for amazing offers!</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden"
    >
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-accent-400 via-accent-500 to-accent-600 rounded-3xl">
        <motion.div
          className="absolute inset-0 opacity-30"
          animate={{
            backgroundPosition: ['0% 0%', '100% 100%'],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            repeatType: 'reverse',
          }}
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.3) 1px, transparent 1px)',
            backgroundSize: '50px 50px',
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 p-8 text-white">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Flame size={32} className="text-yellow-300" />
            </motion.div>
            <div>
              <h3 className="text-2xl font-black tracking-tight">Flash Deal</h3>
              <p className="text-xs text-accent-100 font-bold uppercase tracking-widest">On-Chain • Limited Time</p>
            </div>
          </div>

          {/* Time Remaining */}
          <div className="bg-white/20 backdrop-blur-sm rounded-2xl px-4 py-2">
            <div className="flex items-center gap-2">
              <Clock size={16} />
              <span className="text-sm font-black">
                {selectedDeal.hoursRemaining}h left
              </span>
            </div>
          </div>
        </div>

        {/* Deal Content */}
        <div className="space-y-4">
          {/* Discount Badge */}
          <div className="inline-block">
            <div className="bg-yellow-400 text-gray-900 px-6 py-3 rounded-2xl">
              <div className="flex items-center gap-2">
                <TrendingDown size={24} className="text-red-600" />
                <span className="text-3xl font-black">{selectedDeal.discount}% OFF</span>
              </div>
            </div>
          </div>

          {/* Item Details */}
          <div>
            <h4 className="text-xl font-black mb-2">{selectedDeal.itemName || 'Special Menu Item'}</h4>
            <p className="text-accent-100 font-medium leading-relaxed">
              {selectedDeal.itemDescription || 'Amazing deal on popular menu item'}
            </p>
          </div>

          {/* Pricing */}
          {selectedDeal.originalPrice && (
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-black">
                ${selectedDeal.discountedPrice?.toFixed(2)}
              </span>
              <span className="text-lg text-accent-200 line-through font-bold">
                ${selectedDeal.originalPrice.toFixed(2)}
              </span>
            </div>
          )}

          {/* Inventory */}
          {selectedDeal.inventory > 0 && selectedDeal.inventory <= 10 && (
            <div className="flex items-center gap-2 text-yellow-300">
              <Zap size={16} />
              <span className="text-sm font-bold">
                Only {selectedDeal.inventory} left!
              </span>
            </div>
          )}

          {/* CTA Button */}
          <motion.button
            onClick={handleClaimDeal}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-white text-accent-600 rounded-2xl px-8 py-4 font-black text-lg shadow-xl hover:shadow-2xl transition-all flex items-center justify-center gap-3"
          >
            <ShoppingCart size={24} />
            Claim Deal Now
          </motion.button>

          {/* Deal Source Badge */}
          <div className="flex items-center justify-center gap-2 text-xs text-accent-100">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="font-bold">Verified On-Chain Deal</span>
          </div>
        </div>
      </div>

      {/* Additional Deals Indicator */}
      {deals.length > 1 && (
        <div className="relative z-10 px-8 pb-6">
          <p className="text-center text-sm text-white/80 font-bold">
            + {deals.length - 1} more deal{deals.length > 2 ? 's' : ''} available
          </p>
        </div>
      )}
    </motion.div>
  );
};
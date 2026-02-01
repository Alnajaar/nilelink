'use client';

import React from 'react';
import { Star, Clock, Zap } from 'lucide-react';

interface MerchantCardProps {
  name: string;
  imageUrl: string;
  rating: number;
  reviewCount: number;
  deliveryTime: string;
  loyaltyBonus?: number;
  cuisineType?: string;
  onClick?: () => void;
}

export default function MerchantCard({
  name,
  imageUrl,
  rating,
  reviewCount,
  deliveryTime,
  loyaltyBonus,
  cuisineType,
  onClick,
}: MerchantCardProps) {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-2xl overflow-hidden shadow-elevation-1 hover:shadow-elevation-2 transition-all duration-300 cursor-pointer group"
    >
      {/* Image Container */}
      <div className="relative h-48 overflow-hidden bg-gray-200">
        <img
          src={imageUrl}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />

        {/* Loyalty Bonus Badge */}
        {loyaltyBonus && (
          <div className="absolute top-3 right-3 bg-primary-600 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
            <Zap className="w-3 h-3" />
            +{loyaltyBonus} pts
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Name */}
        <h3 className="text-base font-bold text-text-primary mb-1 line-clamp-1">
          {name}
        </h3>

        {/* Cuisine Type */}
        {cuisineType && (
          <p className="text-xs text-text-tertiary mb-3">{cuisineType}</p>
        )}

        {/* Rating & Delivery Time */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-warning-500 text-warning-500" />
              <span className="text-sm font-semibold text-text-primary">
                {rating.toFixed(1)}
              </span>
            </div>
            <span className="text-xs text-text-tertiary">({reviewCount})</span>
          </div>

          <div className="flex items-center gap-1 text-text-secondary">
            <Clock className="w-4 h-4" />
            <span className="text-xs">{deliveryTime}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

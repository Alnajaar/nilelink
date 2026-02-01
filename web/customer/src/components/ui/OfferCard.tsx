'use client';

import React from 'react';
import { Lock, ArrowRight } from 'lucide-react';

interface OfferCardProps {
  title: string;
  description: string;
  pointsCost: number;
  discount?: string;
  imageUrl?: string;
  locked?: boolean;
  tier?: 'green' | 'gold' | 'platinum';
  onClick?: () => void;
}

const tierColors = {
  green: 'border-primary-200 bg-primary-50',
  gold: 'border-accent-200 bg-accent-50',
  platinum: 'border-gray-200 bg-gray-50',
};

export default function OfferCard({
  title,
  description,
  pointsCost,
  discount,
  imageUrl,
  locked = false,
  tier = 'green',
  onClick,
}: OfferCardProps) {
  return (
    <div
      onClick={onClick}
      className={`
        relative rounded-2xl border-2 overflow-hidden transition-all duration-300
        ${tierColors[tier]} ${!locked ? 'cursor-pointer hover:shadow-lg' : ''}
        ${locked ? 'opacity-60' : ''}
      `}
    >
      {/* Image Section */}
      {imageUrl && (
        <div className="h-40 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Content Section */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="text-base font-bold text-text-primary flex-1">{title}</h3>
          {locked && <Lock className="w-4 h-4 text-gray-400 flex-shrink-0" />}
        </div>

        <p className="text-sm text-text-secondary mb-4 line-clamp-2">
          {description}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-bold text-text-primary">
              {pointsCost}
            </span>
            <span className="text-xs text-text-tertiary">pts</span>
          </div>
          {discount && (
            <span className="text-xs font-semibold text-primary-600 bg-primary-100 px-2 py-1 rounded-full">
              {discount}
            </span>
          )}
          {!locked && (
            <ArrowRight className="w-4 h-4 text-text-secondary" />
          )}
        </div>
      </div>
    </div>
  );
}

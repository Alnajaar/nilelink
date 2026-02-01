"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Heart, Star, Clock, DollarSign } from 'lucide-react';
import { PremiumButton } from '@/components/shared/PremiumButton';
import AuthGuard from '@shared/components/AuthGuard';

export default function WishlistPage() {
    const [favorites, setFavorites] = useState([
        {
            id: '1',
            name: 'Mama\'s Kitchen',
            cuisine: 'Italian',
            rating: 4.8,
            deliveryTime: '25-35 min',
            deliveryFee: 2.99,
            image: '/api/placeholder/300/200'
        },
        {
            id: '2',
            name: 'Spice Route',
            cuisine: 'Indian',
            rating: 4.6,
            deliveryTime: '30-40 min',
            deliveryFee: 0,
            image: '/api/placeholder/300/200'
        }
    ]);

    const removeFromWishlist = (id: string) => {
        setFavorites(favorites.filter(item => item.id !== id));
    };

    return (
        <AuthGuard>
            <div className="min-h-screen bg-gray-50 pt-20 pb-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-4 mb-8">
                        <Link href="/">
                            <PremiumButton variant="ghost" icon={<ArrowLeft size={20} />}>
                                Back
                            </PremiumButton>
                        </Link>
                        <h1 className="text-3xl md:text-4xl font-black text-text-primary">My Favorites</h1>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {favorites.map((restaurant) => (
                            <div key={restaurant.id} className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-200">
                                <div className="h-40 bg-gradient-to-br from-primary-100 to-accent-100 relative overflow-hidden flex items-center justify-center">
                                    <div className="text-6xl">🍽️</div>
                                    <button
                                        onClick={() => removeFromWishlist(restaurant.id)}
                                        className="absolute top-4 right-4 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center hover:bg-white transition-colors"
                                    >
                                        <Heart className="w-4 h-4 text-red-500 fill-current" />
                                    </button>
                                </div>

                                <div className="p-5">
                                    <h3 className="text-lg font-bold text-text-primary mb-1">{restaurant.name}</h3>
                                    <p className="text-sm text-text-secondary mb-3">{restaurant.cuisine}</p>

                                    <div className="flex items-center gap-2 mb-3">
                                        <Star size={14} className="text-yellow-500 fill-current" />
                                        <span className="font-medium">{restaurant.rating}</span>
                                    </div>

                                    <div className="flex items-center justify-between text-sm text-text-secondary mb-4">
                                        <span className="flex items-center gap-1">
                                            <Clock size={14} />
                                            {restaurant.deliveryTime}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <DollarSign size={14} />
                                            ${restaurant.deliveryFee.toFixed(2)}
                                        </span>
                                    </div>

                                    <Link href={`/restaurant/${restaurant.id}`}>
                                        <PremiumButton variant="primary" fullWidth>
                                            Order Now
                                        </PremiumButton>
                                    </Link>
                                </div>
                            </div>
                        ))}

                        {favorites.length === 0 && (
                            <div className="col-span-full text-center py-12">
                                <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-xl font-medium text-gray-600 mb-2">No favorites yet</h3>
                                <p className="text-gray-500 mb-4">Restaurants you love will appear here</p>
                                <Link href="/restaurants">
                                    <PremiumButton>Browse Restaurants</PremiumButton>
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthGuard>
    );
}

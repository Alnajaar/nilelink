"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { restaurantApi } from '@/shared/utils/api';
import {
    Search,
    Filter,
    Star,
    MapPin,
    Clock,
    Heart,
    TrendingUp,
    Award,
    Zap,
    Sparkles,
    ShieldCheck,
    Users,
    ChefHat,
    Navigation,
    Calendar,
    Gift,
    Flame,
    Leaf,
    Timer,
    ShoppingCart,
    History,
    ArrowRight
} from 'lucide-react';

export default function DiscoveryPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
    const [restaurants, setRestaurants] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [userPreferences, setUserPreferences] = useState({
        favoriteCuisine: 'Middle Eastern',
        dietaryRestrictions: ['None'],
        budget: 'medium',
        preferredTime: 'dinner'
    });

    // Fetch restaurants from backend
    useEffect(() => {
        const fetchRestaurants = async () => {
            try {
                const response = await (restaurantApi as any).list();
                setRestaurants(response.restaurants || []);
            } catch (error) {
                console.error('Failed to fetch restaurants:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchRestaurants();
    }, []);

    // Mock AI prediction - in real app this would come from ML service
    const [aiPrediction] = useState({
        mood: 'hungry for comfort food',
        recommendedDish: 'Grilled Chicken Shawarma',
        confidence: 94,
        reasoning: 'Based on your 3 PM ordering pattern and weather'
    });

    return (
        <div className="min-h-screen bg-background-light">
            {/* Advanced Header */}
            <header className="bg-primary-dark text-background-light p-4 shadow-lg">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-background-light rounded-lg flex items-center justify-center">
                            <ShoppingCart className="text-primary-dark" size={24} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold">NileLink</h1>
                            <div className="flex items-center gap-2 text-sm">
                                <MapPin className="text-background-light opacity-70" size={14} />
                                <span>Zamalek, Cairo</span>
                                <div className="w-2 h-2 bg-success rounded-full animate-pulse ml-2"></div>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 bg-background-light bg-opacity-10 px-3 py-2 rounded-lg">
                            <Award className="text-background-light opacity-70" size={16} />
                            <span className="text-sm font-medium">1,247 pts</span>
                        </div>
                        <Link href="/history" className="p-2 rounded-lg hover:bg-background-light hover:bg-opacity-10 transition-colors">
                            <History className="text-background-light" size={20} />
                        </Link>
                    </div>
                </div>
            </header>

            {/* AI-Powered Recommendation */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="bg-gradient-to-r from-primary-dark to-primary-light text-background-light p-6 rounded-xl shadow-lg mb-6"
            >
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-background-light bg-opacity-20 rounded-full flex items-center justify-center">
                            <Sparkles className="text-background-light" size={20} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold">AI Recommendation</h3>
                            <div className="flex items-center gap-2 text-sm opacity-90">
                                <span>{aiPrediction.confidence}% match</span>
                                <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
                            </div>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-sm opacity-75">Based on your preferences</div>
                        <div className="text-xs opacity-60">{aiPrediction.reasoning}</div>
                    </div>
                </div>

                <div className="bg-background-light bg-opacity-10 rounded-lg p-4">
                    <h4 className="text-xl font-bold text-background-light mb-2">{aiPrediction.recommendedDish}</h4>
                    <p className="text-background-light opacity-90 mb-4">Feeling {aiPrediction.mood}? This matches your taste profile perfectly.</p>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm">
                            <span className="flex items-center gap-1">
                                <Star className="text-warning" size={14} fill="currentColor" />
                                4.9 rating
                            </span>
                            <span className="flex items-center gap-1">
                                <Clock className="text-background-light opacity-70" size={14} />
                                15-20 min
                            </span>
                            <span className="flex items-center gap-1">
                                <Leaf className="text-success" size={14} />
                                Fresh ingredients
                            </span>
                        </div>
                        <Link href="/shop/1" className="bg-success text-background-light px-6 py-2 rounded-lg font-medium hover:bg-success-light transition-colors flex items-center gap-2">
                            Order Now
                            <ArrowRight size={16} />
                        </Link>
                    </div>
                </div>
            </motion.div>

            {/* Advanced Search & Filters */}
            <div className="bg-background-white p-4 rounded-xl border border-border-light shadow-sm mb-6">
                <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary" size={20} />
                    <input
                        type="text"
                        placeholder="Search restaurants, cuisines, dishes..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-dark focus:border-transparent"
                    />
                </div>

                <div className="flex gap-2 overflow-x-auto pb-2">
                    {['Fast Delivery', 'Highly Rated', 'Budget Friendly', 'Vegetarian', 'Halal', 'Offers', 'New'].map((filter) => (
                        <button
                            key={filter}
                            onClick={() => setSelectedFilters(prev =>
                                prev.includes(filter)
                                    ? prev.filter(f => f !== filter)
                                    : [...prev, filter]
                            )}
                            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${selectedFilters.includes(filter)
                                ? 'bg-primary-dark text-background-light'
                                : 'bg-background-light text-text-secondary hover:bg-border-light'
                                }`}
                        >
                            {filter}
                        </button>
                    ))}
                </div>
            </div>

            {/* Restaurant Discovery Grid */}
            <section className="mb-20">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-primary-dark">Nearby Restaurants</h2>
                    <div className="flex items-center gap-2">
                        <ShieldCheck className="text-success-default" size={16} />
                        <span className="text-sm text-text-secondary">Protocol Verified</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {restaurants.length > 0 ? restaurants.map((shop, i) => (
                        <motion.div
                            key={shop.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1, duration: 0.6 }}
                        >
                            <Link href={`/shop/${shop.id}`}>
                                <div className="bg-background-white rounded-xl border border-border-light hover:shadow-lg transition-all overflow-hidden group">
                                    {/* Restaurant Image Placeholder */}
                                    <div className="h-32 bg-gradient-to-r from-primary-light to-primary-dark relative">
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <span className="text-4xl">{shop.logo}</span>
                                        </div>
                                        <div className="absolute top-3 right-3 flex gap-2">
                                            <div className="bg-background-light bg-opacity-90 px-2 py-1 rounded-full text-xs font-medium">
                                                <Heart className="inline w-3 h-3 mr-1" />
                                                Save
                                            </div>
                                        </div>
                                        <div className="absolute bottom-3 left-3">
                                            <div className="bg-success text-background-light px-2 py-1 rounded-full text-xs font-medium">
                                                Open • Closes 11 PM
                                            </div>
                                        </div>
                                    </div>

                                    {/* Restaurant Info */}
                                    <div className="p-4">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="font-bold text-lg text-primary-dark group-hover:text-primary-light transition-colors">
                                                {shop.name}
                                            </h3>
                                            <div className="flex items-center gap-1">
                                                <Star className="text-warning" size={14} fill="currentColor" />
                                                <span className="text-sm font-medium">{shop.rating}</span>
                                            </div>
                                        </div>

                                        <p className="text-sm text-text-secondary mb-3">{shop.category} Cuisine</p>

                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4 text-sm text-text-secondary">
                                                <div className="flex items-center gap-1">
                                                    <Clock size={14} />
                                                    <span>{shop.time}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <MapPin size={14} />
                                                    <span>2.3 km</span>
                                                </div>
                                            </div>

                                            <div className="flex gap-2">
                                                {shop.category === 'Health' && (
                                                    <div className="bg-success bg-opacity-10 text-success px-2 py-1 rounded-full text-xs">
                                                        Pharmacy
                                                    </div>
                                                )}
                                                {shop.rating >= 4.8 && (
                                                    <div className="bg-warning bg-opacity-10 text-warning px-2 py-1 rounded-full text-xs">
                                                        Top Rated
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Special Offers */}
                                        {shop.id === '1' && (
                                            <div className="mt-3 bg-primary-dark bg-opacity-5 border border-primary-dark border-opacity-20 p-2 rounded-lg">
                                                <div className="flex items-center gap-2 text-sm">
                                                    <Flame className="text-error" size={14} />
                                                    <span className="text-primary-dark font-medium">20% off first order</span>
                                                    <Gift className="text-success ml-auto" size={14} />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    )) : (
                        <div className="col-span-full py-16 text-center bg-white rounded-xl border-2 border-dashed border-primary-dark/10">
                            <ChefHat className="mx-auto mb-4 text-primary-dark/20" size={48} />
                            <h3 className="text-lg font-semibold text-primary-dark">No restaurants nearby</h3>
                            <p className="text-sm text-text-secondary mt-1">Check back later or try adjusting filters.</p>
                        </div>
                    )}
                </div>
            </section>

            {/* Quick Access Features */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-background-white p-4 rounded-xl border border-border-light text-center hover:shadow-md transition-shadow">
                    <Calendar className="text-primary-dark mx-auto mb-2" size={24} />
                    <div className="text-sm font-medium text-primary-dark">Schedule Order</div>
                    <div className="text-xs text-text-secondary mt-1">Plan ahead</div>
                </div>

                <div className="bg-background-white p-4 rounded-xl border border-border-light text-center hover:shadow-md transition-shadow">
                    <Award className="text-success mx-auto mb-2" size={24} />
                    <div className="text-sm font-medium text-primary-dark">Loyalty Rewards</div>
                    <div className="text-xs text-text-secondary mt-1">1,247 points</div>
                </div>

                <div className="bg-background-white p-4 rounded-xl border border-border-light text-center hover:shadow-md transition-shadow">
                    <Users className="text-info mx-auto mb-2" size={24} />
                    <div className="text-sm font-medium text-primary-dark">Group Orders</div>
                    <div className="text-xs text-text-secondary mt-1">Split the bill</div>
                </div>

                <div className="bg-background-white p-4 rounded-xl border border-border-light text-center hover:shadow-md transition-shadow">
                    <TrendingUp className="text-warning mx-auto mb-2" size={24} />
                    <div className="text-sm font-medium text-primary-dark">Analytics</div>
                    <div className="text-xs text-text-secondary mt-1">Your preferences</div>
                </div>
            </div>

            {/* Bottom Navigation */}
            <div className="fixed bottom-0 left-0 w-full bg-background-white border-t border-border-light px-6 py-4">
                <div className="flex justify-around items-center">
                    <button className="flex flex-col items-center gap-1 text-primary-dark">
                        <Search size={20} />
                        <span className="text-xs">Discover</span>
                    </button>

                    <button className="flex flex-col items-center gap-1 text-text-secondary hover:text-primary-dark transition-colors">
                        <Heart size={20} />
                        <span className="text-xs">Favorites</span>
                    </button>

                    <Link href="/checkout" className="flex flex-col items-center gap-1 text-text-secondary hover:text-primary-dark transition-colors relative">
                        <div className="relative">
                            <ShoppingCart size={20} />
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary-dark text-background-light rounded-full flex items-center justify-center text-xs">2</div>
                        </div>
                        <span className="text-xs">Cart</span>
                    </Link>

                    <button className="flex flex-col items-center gap-1 text-text-secondary hover:text-primary-dark transition-colors">
                        <Award size={20} />
                        <span className="text-xs">Profile</span>
                    </button>
                </div>
            </div>

            {/* Add bottom padding for fixed nav */}
            <div className="h-20"></div>
        </div>
    );
}

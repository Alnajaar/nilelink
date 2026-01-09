"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
    TrendingUp, DollarSign, Users, Building, ShoppingCart,
    Search, Filter, Star, MapPin, BarChart3, ArrowRight
} from 'lucide-react';

import { Button } from '@/shared/components/Button';
import { Card } from '@/shared/components/Card';
import { Badge } from '@/shared/components/Badge';

interface Restaurant {
    id: string;
    name: string;
    cuisine: string;
    location: string;
    sharePrice: number;
    priceChange24h: number;
    marketCap: number;
    dailyRevenue: number;
    dividendYield: number;
    rating: number;
    totalShares: number;
    availableShares: number;
    image?: string;
}

export default function MarketplacePage() {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');
    const [filter, setFilter] = useState<'all' | 'trending' | 'high-yield' | 'new'>('all');

    const [restaurants] = useState<Restaurant[]>([
        {
            id: 'rest-001',
            name: 'Cairo Grill Prime',
            cuisine: 'Mediterranean',
            location: 'Downtown Cairo',
            sharePrice: 125.50,
            priceChange24h: 5.2,
            marketCap: 2500000,
            dailyRevenue: 45000,
            dividendYield: 8.5,
            rating: 4.8,
            totalShares: 20000,
            availableShares: 2500
        },
        {
            id: 'rest-002',
            name: 'Nile Bistro',
            cuisine: 'French',
            location: 'Zamalek',
            sharePrice: 89.00,
            priceChange24h: -2.1,
            marketCap: 1780000,
            dailyRevenue: 32000,
            dividendYield: 12.3,
            rating: 4.6,
            totalShares: 20000,
            availableShares: 5000
        },
        {
            id: 'rest-003',
            name: 'Delta Kitchen',
            cuisine: 'Egyptian',
            location: 'Maadi',
            sharePrice: 52.25,
            priceChange24h: 8.7,
            marketCap: 1045000,
            dailyRevenue: 28000,
            dividendYield: 15.0,
            rating: 4.9,
            totalShares: 20000,
            availableShares: 1200
        },
        {
            id: 'rest-004',
            name: 'Spice Route',
            cuisine: 'Indian',
            location: 'Heliopolis',
            sharePrice: 72.80,
            priceChange24h: 3.4,
            marketCap: 1456000,
            dailyRevenue: 35000,
            dividendYield: 10.2,
            rating: 4.7,
            totalShares: 20000,
            availableShares: 3400
        }
    ]);

    const filteredRestaurants = restaurants.filter(r => {
        const matchesSearch = r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            r.cuisine.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesSearch;
    });

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <div className="bg-white border-b border-surface px-6 py-4">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-4xl font-black text-text mb-2">Restaurant Marketplace</h1>
                            <p className="text-text opacity-70">Invest in the future of dining - fractional ownership starts at $10</p>
                        </div>
                        <Button
                            onClick={() => router.push('/list-restaurant')}
                            className="bg-primary hover:opacity-90 text-background h-12 px-6 rounded-xl font-black uppercase tracking-widest"
                        >
                            <Building size={18} className="mr-2" />
                            List Your Restaurant
                        </Button>
                    </div>

                    {/* Search & Filters */}
                    <div className="flex gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text opacity-30" size={18} />
                            <input
                                type="text"
                                placeholder="Search restaurants or cuisine..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full h-12 pl-10 pr-4 bg-surface rounded-xl border-0 focus:outline-none focus:ring-2 focus:ring-primary/20 text-text font-medium placeholder:text-text placeholder:opacity-30"
                            />
                        </div>
                        <div className="flex gap-2">
                            {(['all', 'trending', 'high-yield', 'new'] as const).map((f) => (
                                <button
                                    key={f}
                                    onClick={() => setFilter(f)}
                                    className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${filter === f
                                            ? 'bg-primary text-background'
                                            : 'bg-surface text-text hover:bg-surface/70'
                                        }`}
                                >
                                    {f.replace('-', ' ')}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Market Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <Card className="p-6 bg-white border border-surface">
                        <div className="flex items-center justify-between mb-2">
                            <DollarSign size={24} className="text-primary" />
                            <TrendingUp size={16} className="text-primary" />
                        </div>
                        <p className="text-xs text-text opacity-50 uppercase tracking-widest font-bold mb-1">
                            Total Market Cap
                        </p>
                        <p className="text-2xl font-black font-mono text-text">
                            ${(restaurants.reduce((sum, r) => sum + r.marketCap, 0) / 1000000).toFixed(1)}M
                        </p>
                    </Card>

                    <Card className="p-6 bg-white border border-surface">
                        <div className="flex items-center justify-between mb-2">
                            <Building size={24} className="text-primary" />
                        </div>
                        <p className="text-xs text-text opacity-50 uppercase tracking-widest font-bold mb-1">
                            Listed Restaurants
                        </p>
                        <p className="text-2xl font-black font-mono text-text">
                            {restaurants.length}
                        </p>
                    </Card>

                    <Card className="p-6 bg-white border border-surface">
                        <div className="flex items-center justify-between mb-2">
                            <Users size={24} className="text-primary" />
                        </div>
                        <p className="text-xs text-text opacity-50 uppercase tracking-widest font-bold mb-1">
                            Active Investors
                        </p>
                        <p className="text-2xl font-black font-mono text-text">
                            2,847
                        </p>
                    </Card>

                    <Card className="p-6 bg-primary text-background">
                        <div className="flex items-center justify-between mb-2">
                            <BarChart3 size={24} />
                            <TrendingUp size={16} />
                        </div>
                        <p className="text-xs opacity-70 uppercase tracking-widest font-bold mb-1">
                            Avg Dividend Yield
                        </p>
                        <p className="text-2xl font-black font-mono">
                            {(restaurants.reduce((sum, r) => sum + r.dividendYield, 0) / restaurants.length).toFixed(1)}%
                        </p>
                    </Card>
                </div>

                {/* Restaurant Cards */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {filteredRestaurants.map((restaurant, idx) => (
                        <motion.div
                            key={restaurant.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                        >
                            <Card className="p-6 bg-white border border-surface hover:shadow-xl transition-all cursor-pointer group"
                                onClick={() => router.push(`/restaurant/${restaurant.id}`)}>
                                {/* Header */}
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                        <h3 className="text-2xl font-black text-text mb-1">{restaurant.name}</h3>
                                        <div className="flex items-center gap-3 text-sm text-text opacity-70">
                                            <Badge className="bg-primary/10 text-primary px-2 py-1 text-xs font-bold">
                                                {restaurant.cuisine}
                                            </Badge>
                                            <div className="flex items-center gap-1">
                                                <MapPin size={14} />
                                                {restaurant.location}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Star size={14} className="fill-primary text-primary" />
                                                {restaurant.rating}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-3xl font-mono font-black text-primary">
                                            ${restaurant.sharePrice}
                                        </p>
                                        <p className={`text-sm font-bold ${restaurant.priceChange24h > 0 ? 'text-primary' : 'text-text'
                                            }`}>
                                            {restaurant.priceChange24h > 0 ? '+' : ''}
                                            {restaurant.priceChange24h.toFixed(1)}% (24h)
                                        </p>
                                    </div>
                                </div>

                                {/* Metrics */}
                                <div className="grid grid-cols-3 gap-4 mb-4 p-4 bg-surface/30 rounded-xl">
                                    <div>
                                        <p className="text-xs text-text opacity-50 uppercase font-bold mb-1">Daily Revenue</p>
                                        <p className="text-lg font-mono font-bold text-text">
                                            ${(restaurant.dailyRevenue / 1000).toFixed(0)}k
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-text opacity-50 uppercase font-bold mb-1">Dividend Yield</p>
                                        <p className="text-lg font-mono font-bold text-primary">
                                            {restaurant.dividendYield}%
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-text opacity-50 uppercase font-bold mb-1">Available</p>
                                        <p className="text-lg font-mono font-bold text-text">
                                            {restaurant.availableShares}
                                        </p>
                                    </div>
                                </div>

                                {/* Action */}
                                <div className="flex gap-3">
                                    <Button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            router.push(`/trade?restaurant=${restaurant.id}&action=buy`);
                                        }}
                                        className="flex-1 bg-primary hover:opacity-90 text-background h-12 rounded-xl font-black uppercase tracking-widest"
                                    >
                                        <ShoppingCart size={18} className="mr-2" />
                                        Invest Now
                                    </Button>
                                    <Button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            router.push(`/restaurant/${restaurant.id}`);
                                        }}
                                        variant="outline"
                                        className="h-12 px-6 rounded-xl font-bold"
                                    >
                                        Details
                                        <ArrowRight size={18} className="ml-2" />
                                    </Button>
                                </div>
                            </Card>
                        </motion.div>
                    ))}
                </div>

                {/* Empty State */}
                {filteredRestaurants.length === 0 && (
                    <div className="h-96 flex flex-col items-center justify-center text-center opacity-30">
                        <Building size={64} className="text-text mb-4" />
                        <p className="text-lg font-bold text-text">No restaurants found</p>
                        <p className="text-sm text-text mt-2">Try adjusting your search or filters</p>
                    </div>
                )}
            </div>
        </div>
    );
}

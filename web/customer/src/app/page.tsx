"use client";

import React from 'react';
import Link from 'next/link';
import {
    ShoppingBag,
    Users,
    Search,
    ArrowRight,
    Star,
    Clock,
    Bike
} from 'lucide-react';

import { DemandPulse } from '@/components/DemandPulse';

export default function DiscoveryPage() {
    const mockRestaurants = [
        {
            id: 1,
            name: 'Cairo Healthy Kitchen',
            category: 'Healthy',
            rating: 4.9,
            time: '20 min',
            delivery: '$1.50'
        },
        {
            id: 2,
            name: 'Zamalek Bakery',
            category: 'Bakery',
            rating: 4.7,
            time: '15 min',
            delivery: '$2.00'
        },
        {
            id: 3,
            name: 'Nile Pizza Co',
            category: 'Pizza',
            rating: 4.8,
            time: '25 min',
            delivery: '$2.50'
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <DemandPulse />

            {/* Header */}
            <header className="bg-white shadow-sm p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-xl font-bold text-blue-600">NileLink Customer</h1>
                    <div className="flex items-center gap-3">
                        <Link href="/auth/login">
                            <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                                Login
                            </button>
                        </Link>
                    </div>
                </div>
            </header>

            <main className="container mx-auto p-4 space-y-8">
                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        className="w-full h-14 pl-12 pr-4 bg-white border border-gray-200 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-medium placeholder:text-gray-400"
                        placeholder="What are you craving?"
                    />
                </div>

                {/* Featured Restaurant */}
                <div className="p-6 rounded-2xl bg-gradient-to-br from-green-600 to-green-800 text-white relative overflow-hidden shadow-xl">
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-4">
                            <span className="bg-white/20 text-white px-2 py-1 rounded text-xs font-medium">AI PICK</span>
                            <span className="text-xs text-green-200">Recommended for you</span>
                        </div>
                        <h3 className="text-2xl font-bold mb-2">Create Your Own Bowl</h3>
                        <p className="text-sm text-green-100/80 mb-6">Cairo Healthy Kitchen • 20 min • 4.9 ⭐</p>
                        <Link href="/checkout">
                            <button className="bg-white text-green-700 hover:bg-green-50 font-bold py-3 px-6 rounded-xl transition-colors flex items-center gap-2">
                                Order Now <ArrowRight size={16} />
                            </button>
                        </Link>
                    </div>
                </div>

                {/* Restaurant List */}
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-gray-800 uppercase tracking-tight">Nearby Restaurants</h3>
                        <span className="text-sm font-medium text-blue-600 cursor-pointer hover:underline">View All</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {mockRestaurants.map((restaurant) => (
                            <Link href={`/shop/${restaurant.id}`} key={restaurant.id}>
                                <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all group">
                                    <div className="h-40 bg-gray-100 relative overflow-hidden">
                                        <div className="absolute inset-0 flex items-center justify-center text-4xl group-hover:scale-110 transition-transform duration-500">
                                            🍽️
                                        </div>
                                    </div>
                                    <div className="p-4">
                                        <div className="flex justify-between items-start mb-1">
                                            <h4 className="text-lg font-bold text-gray-800">{restaurant.name}</h4>
                                            <div className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-md">
                                                <Star size={12} className="text-yellow-500" fill="currentColor" />
                                                <span className="text-xs font-bold text-gray-800">{restaurant.rating}</span>
                                            </div>
                                        </div>
                                        <p className="text-sm text-gray-600 font-medium mb-3">{restaurant.category} • $</p>

                                        <div className="flex items-center gap-4 text-sm font-medium text-gray-500">
                                            <span className="flex items-center gap-1">
                                                <Clock size={14} /> {restaurant.time}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Bike size={14} /> {restaurant.delivery}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </main>

            {/* Mobile Nav */}
            <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 px-6 py-2 pb-6 z-50 md:hidden">
                <div className="flex justify-around items-center">
                    <button className="flex flex-col items-center gap-1 text-blue-600 p-2">
                        <Search size={24} />
                        <span className="text-xs font-bold uppercase tracking-widest">Shop</span>
                    </button>
                    <Link href="/checkout">
                        <button className="flex flex-col items-center gap-1 text-gray-400 p-2 hover:text-blue-600 transition-colors">
                            <ShoppingBag size={24} />
                            <span className="text-xs font-bold uppercase tracking-widest">Cart</span>
                        </button>
                    </Link>
                    <Link href="/auth/login">
                        <button className="flex flex-col items-center gap-1 text-gray-400 p-2 hover:text-blue-600 transition-colors">
                            <Users size={24} />
                            <span className="text-xs font-bold uppercase tracking-widest">Profile</span>
                        </button>
                    </Link>
                </div>
            </div>
        </div>
    );
}

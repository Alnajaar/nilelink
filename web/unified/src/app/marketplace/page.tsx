"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, ShoppingBag, Tag, ArrowRight, Heart, Crown } from 'lucide-react';
import { Button } from '@/shared/components/Button';
import { Card } from '@/shared/components/Card';
import { Input } from '@/shared/components/Input';
import { Badge } from '@/shared/components/Badge';
import { PageTransition } from '@/shared/components/PageTransition';
import { EmptyState } from '@/shared/components/EmptyState';
import { LoadingState } from '@/shared/components/LoadingState';
import { CurrencyDisplay } from '@/shared/components/CurrencyDisplay';
import { URLS } from '@/shared/utils/urls';
import { useDemo } from '@/contexts/DemoContext';
import { TrendingUp, Zap, Bot } from 'lucide-react';
import { NegotiationModal } from './components/NegotiationModal';

// Mock data type until we fully integrate with backend fetching in SWR/React Query
interface Listing {
    id: string;
    name: string;
    description: string;
    price: number;
    originalPrice?: number; // For demo/dynamic mode
    isDynamic?: boolean; // For demo/dynamic mode
    image?: string;
    seller: {
        restaurant?: { name: string };
        userId: string;
    };
    category: string;
    type: 'PHYSICAL' | 'SERVICE';
    stock: number;
    rating?: number;
    reviewCount?: number;
}

export default function MarketplaceLanding() {
    const [listings, setListings] = useState<Listing[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('ALL');
    const [sortBy, setSortBy] = useState('RELEVANCE');
    const [priceRange, setPriceRange] = useState({ min: '', max: '' });
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [ratingFilter, setRatingFilter] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(12);

    // Negotiation State
    const [negotiatingListing, setNegotiatingListing] = useState<Listing | null>(null);

    useEffect(() => {
        // Fetch listings from API
        const fetchListings = async () => {
            try {
                // In a real scenario, use URLS.api
                // const res = await fetch(`${URLS.api}/marketplace/listings`);
                // const data = await res.json();

                // Simulating API response for development stability
                await new Promise(r => setTimeout(r, 1000));

                const mockListings: Listing[] = [
                    {
                        id: '1',
                        name: 'Premium Coffee Beans (1kg)',
                        description: 'Ethically sourced, single-origin Arabica beans roasted to perfection.',
                        price: 24.99,
                        category: 'Food & Beverage',
                        type: 'PHYSICAL',
                        stock: 50,
                        rating: 4.8,
                        reviewCount: 124,
                        seller: { restaurant: { name: 'Bean & Brew' }, userId: '1' }
                    },
                    {
                        id: '2',
                        name: 'Catering Service - Gold Package',
                        description: 'Full service catering for up to 50 guests. Includes setup and service.',
                        price: 499.00,
                        category: 'Services',
                        type: 'SERVICE',
                        stock: 10,
                        seller: { restaurant: { name: 'Grand Feast' }, userId: '2' }
                    },
                    {
                        id: '3',
                        name: 'Commercial Kitchen Deep Clean',
                        description: 'Professional deep cleaning service for commercial kitchens. Certified agents.',
                        price: 250.00,
                        category: 'Maintenance',
                        type: 'SERVICE',
                        stock: 100,
                        seller: { userId: '3' } // Freelancer
                    },
                    {
                        id: '4',
                        name: 'Organic Local Vegetables Box',
                        description: 'Seasonal mix of organic vegetables from local partner farms.',
                        price: 35.00,
                        category: 'Produce',
                        type: 'PHYSICAL',
                        stock: 20,
                        seller: { restaurant: { name: 'Farm to Fork' }, userId: '4' }
                    }
                ];
                setListings(mockListings);
                setLoading(false);
            } catch (error) {
                console.error("Failed to fetch listings", error);
                setLoading(false);
            }
        };

        fetchListings();
        fetchListings();
    }, []);

    // DEMO MODE: Neural Pricing Simulation
    const { isDemoMode } = useDemo();
    useEffect(() => {
        if (!isDemoMode || listings.length === 0) return;

        const interval = setInterval(() => {
            setListings(prev => prev.map(item => {
                // Randomly fluctuate price for "Dynamic" items (simulating Neural Service)
                if (Math.random() > 0.7) {
                    const volatility = 0.05; // 5% swing
                    const change = 1 + (Math.random() * volatility * 2 - volatility);
                    const newPrice = item.price * change;
                    return {
                        ...item,
                        price: newPrice,
                        originalPrice: item.originalPrice || item.price,
                        isDynamic: true
                    };
                }
                return item;
            }));
        }, 3000); // Update every 3 seconds

        return () => clearInterval(interval);
    }, [isDemoMode, listings.length]);

    const filteredListings = listings.filter(l => {
        const matchesSearch = l.name.toLowerCase().includes(search.toLowerCase()) ||
            l.description.toLowerCase().includes(search.toLowerCase());
        const matchesType = filter === 'ALL' || l.type === filter;
        const matchesCategories = selectedCategories.length === 0 || selectedCategories.includes(l.category);
        const matchesPrice = (!priceRange.min || l.price >= parseFloat(priceRange.min)) &&
            (!priceRange.max || l.price <= parseFloat(priceRange.max));
        // For now, assume all listings have 4+ rating
        const matchesRating = ratingFilter === 0 || (l as any).rating >= ratingFilter;
        return matchesSearch && matchesType && matchesCategories && matchesPrice && matchesRating;
    }).sort((a, b) => {
        switch (sortBy) {
            case 'PRICE_LOW':
                return a.price - b.price;
            case 'PRICE_HIGH':
                return b.price - a.price;
            case 'NEWEST':
                return new Date((b as any).createdAt || 0).getTime() - new Date((a as any).createdAt || 0).getTime();
            case 'POPULARITY':
                return ((b as any).popularity || 0) - ((a as any).popularity || 0);
            default:
                return 0;
        }
    });

    const totalPages = Math.ceil(filteredListings.length / itemsPerPage);
    const paginatedListings = filteredListings.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    return (
        <PageTransition>
            <div className="space-y-12">
                {/* Hero / Header */}
                <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-border-subtle pb-8">
                    <div>
                        <Badge variant="info" className="mb-4 bg-primary-surface text-text-main border-border-subtle font-bold">
                            NILELINK MARKETPLACE
                        </Badge>
                        <h1 className="text-4xl md:text-5xl font-black text-text-main leading-tight mb-4">
                            Discover & Trade <br />
                            <span className="text-accent italic">Across the Ecosystem</span>
                        </h1>
                        <p className="text-text-muted max-w-xl text-lg">
                            Source supplies, book services, and trade goods securely with built-in escrow and delivery integration.
                        </p>
                    </div>
                    <div className="w-full md:w-auto flex gap-3">
                        <Button variant="outline" className="h-12 px-6 border-accent text-accent hover:bg-accent/10" onClick={() => window.location.href = '/marketplace/subscriptions'}>
                            <Crown className="mr-2" size={20} />
                            Subscriptions
                        </Button>
                        <Button variant="outline" className="h-12 px-6 border-accent text-accent hover:bg-accent/10" onClick={() => window.location.href = '/marketplace/my-subscriptions'}>
                            <Heart className="mr-2" size={20} />
                            My Subscriptions
                        </Button>
                        <Button variant="outline" className="h-12 px-6 border-accent text-accent hover:bg-accent/10" onClick={() => window.location.href = '/marketplace/seller'}>
                            Become a Seller
                        </Button>
                        <Button className="h-12 px-6 shadow-lg shadow-accent/20 bg-accent text-background hover:bg-accent-light">
                            <ShoppingBag className="mr-2" size={20} />
                            My Orders
                        </Button>
                    </div>
                </div>

                {/* Search & Filter Bar */}
                <Card padding="md" className="sticky top-20 z-30 shadow-xl shadow-black/20 border-border-subtle backdrop-blur-md bg-background-card/90">
                    <div className="flex flex-col md:flex-row gap-4 items-center">
                        <div className="relative flex-1 w-full">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={20} />
                            <Input
                                placeholder="Search listings..."
                                className="pl-12 h-12 text-lg border-transparent bg-background-subtle focus:bg-background-card transition-all text-text-main"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-2 w-full md:w-auto items-center">
                            <div className="flex gap-2">
                                <Input
                                    placeholder="Min Price"
                                    type="number"
                                    value={priceRange.min}
                                    onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
                                    className="w-20 px-2 py-3 rounded-xl bg-background-subtle border-transparent focus:border-accent transition-all text-sm text-text-main"
                                />
                                <Input
                                    placeholder="Max Price"
                                    type="number"
                                    value={priceRange.max}
                                    onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                                    className="w-20 px-2 py-3 rounded-xl bg-background-subtle border-transparent focus:border-accent transition-all text-sm text-text-main"
                                />
                            </div>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="px-4 py-3 rounded-xl bg-background-subtle text-text-main border-transparent focus:border-accent transition-all"
                            >
                                <option value="RELEVANCE">Sort by Relevance</option>
                                <option value="PRICE_LOW">Price: Low to High</option>
                                <option value="PRICE_HIGH">Price: High to Low</option>
                                <option value="NEWEST">Newest First</option>
                                <option value="POPULARITY">Most Popular</option>
                            </select>
                            {['ALL', 'PHYSICAL', 'SERVICE'].map((f) => (
                                <button
                                    key={f}
                                    onClick={() => setFilter(f)}
                                    className={`px-6 py-3 rounded-xl font-bold text-sm transition-all ${filter === f
                                        ? 'bg-accent text-background border border-accent shadow-md'
                                        : 'bg-background-subtle text-text-muted hover:bg-background-card border border-transparent'
                                        }`}
                                >
                                    {f}
                                </button>
                            ))}
                        </div>
                    </div>
                </Card>

                {/* Listings Grid */}
                {loading ? (
                    <div className="py-20">
                        <LoadingState message="Loading marketplace..." />
                    </div>
                ) : paginatedListings.length > 0 ? (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                            {paginatedListings.map((listing) => (
                                <motion.div
                                    key={listing.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    whileHover={{ y: -5 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <Card padding="none" className="h-full flex flex-col group border-border-subtle hover:border-accent/40 transition-all shadow-sm hover:shadow-2xl hover:shadow-black/40 bg-background-card">
                                        <div className="h-48 bg-gradient-to-br from-background-subtle to-background relative overflow-hidden">
                                            {/* Placeholder for image */}
                                            <div className="absolute inset-0 flex items-center justify-center text-text-muted/10 font-black text-6xl uppercase tracking-tighter">
                                                {listing.type === 'PHYSICAL' ? 'ITEM' : 'SVC'}
                                            </div>
                                            <div className="absolute top-4 right-4 flex flex-col gap-2 items-end">
                                                <Badge variant={listing.type === 'PHYSICAL' ? 'success' : 'warning'} className="shadow-sm">
                                                    {listing.type}
                                                </Badge>
                                                {listing.isDynamic && (
                                                    <Badge variant="info" className="shadow-sm animate-pulse bg-info/20 text-info border-info/30">
                                                        <Zap size={12} className="mr-1 fill-current" /> DYNAMIC
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                        <div className="p-6 flex-1 flex flex-col">
                                            <div className="flex justify-between items-start mb-2">
                                                <p className="text-xs font-bold text-accent uppercase tracking-wider">{listing.category}</p>
                                                <p className="text-xs font-medium text-text-muted">{listing.seller.restaurant?.name || 'Verified Seller'}</p>
                                            </div>
                                            <h3 className="text-xl font-black text-text-main mb-2 line-clamp-2 group-hover:text-accent transition-colors">
                                                {listing.name}
                                            </h3>
                                            <p className="text-text-muted text-sm line-clamp-2 mb-6 flex-1">
                                                {listing.description}
                                            </p>
                                            <div className="flex items-center justify-between pt-4 border-t border-border-subtle">
                                                <div>
                                                    <CurrencyDisplay amount={listing.price} className={`text-2xl transition-all duration-500 ${listing.isDynamic ? 'text-secondary font-black' : 'text-text-main'}`} />
                                                    {listing.isDynamic && (
                                                        <p className="text-[10px] text-secondary font-mono flex items-center">
                                                            <TrendingUp size={10} className="mr-1" />
                                                            High Demand
                                                        </p>
                                                    )}
                                                </div>
                                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all">
                                                    <Button size="sm" variant="outline" className="w-8 h-8 rounded-lg border-border-subtle text-text-muted hover:text-accent hover:border-accent" onClick={() => setNegotiatingListing(listing)} title="AI Smart Buy">
                                                        <Bot size={16} />
                                                    </Button>
                                                    <Button size="sm" className="rounded-lg px-4 font-bold bg-accent text-background hover:bg-accent-light">
                                                        View <ArrowRight size={16} className="ml-1" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </Card>
                                </motion.div>
                            ))}
                        </div>

                        {/* Negotiation Modal */}
                        {negotiatingListing && (
                            <NegotiationModal
                                listing={negotiatingListing}
                                isOpen={!!negotiatingListing}
                                onClose={() => setNegotiatingListing(null)}
                            />
                        )}

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex justify-center gap-2">
                                <button
                                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                    disabled={currentPage === 1}
                                    className="px-4 py-2 rounded-lg bg-surface hover:bg-surface/80 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Previous
                                </button>
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                    <button
                                        key={page}
                                        onClick={() => setCurrentPage(page)}
                                        className={`px-4 py-2 rounded-lg ${currentPage === page
                                            ? 'bg-primary text-white'
                                            : 'bg-surface hover:bg-surface/80'
                                            }`}
                                    >
                                        {page}
                                    </button>
                                ))}
                                <button
                                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                    disabled={currentPage === totalPages}
                                    className="px-4 py-2 rounded-lg bg-surface hover:bg-surface/80 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </>
                ) : (
                    <EmptyState
                        title="No listings found"
                        description="Try adjusting your search or filters."
                        icon={<Tag size={48} />}
                        action={{ label: 'Reset Filters', onClick: () => { setSearch(''); setFilter('ALL'); setSelectedCategories([]); setPriceRange({ min: '', max: '' }); setRatingFilter(0); } }}
                    />
                )}
            </div>
        </PageTransition>
    );
}

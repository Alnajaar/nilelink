"use client";

import React, { useState, useEffect } from 'react';
import { Search, Filter, Star, Clock, DollarSign, MapPin, Heart, ShoppingCart, ChefHat } from 'lucide-react';
import { Button } from '@/components/shared/Button';
import { Card } from '@/components/shared/Card';
import { Input } from '@/components/shared/Input';
import { useCustomer } from '@/contexts/CustomerContext';
import AuthGuard from '@shared/components/AuthGuard';

interface Restaurant {
    id: string;
    name: string;
    cuisine: string;
    rating: number;
    reviewCount: number;
    deliveryTime: string;
    deliveryFee: number;
    minimumOrder: number;
    distance: number;
    image: string;
    isOpen: boolean;
    offers: string[];
    tags: string[];
}

interface FilterOptions {
    cuisine: string[];
    priceRange: string;
    deliveryTime: string;
    rating: number;
    offers: string[];
}

export default function SearchPage() {
    const { addToCart } = useCustomer();
    const [searchQuery, setSearchQuery] = useState('');
    const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
    const [filteredRestaurants, setFilteredRestaurants] = useState<Restaurant[]>([]);
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState<FilterOptions>({
        cuisine: [],
        priceRange: 'all',
        deliveryTime: 'all',
        rating: 0,
        offers: []
    });
    const [sortBy, setSortBy] = useState<'rating' | 'deliveryTime' | 'distance' | 'price'>('rating');
    const [favorites, setFavorites] = useState<Set<string>>(new Set());

    // Mock restaurant data
    const mockRestaurants: Restaurant[] = [
        {
            id: '1',
            name: 'Mama\'s Kitchen',
            cuisine: 'Italian',
            rating: 4.8,
            reviewCount: 1247,
            deliveryTime: '25-35 min',
            deliveryFee: 2.99,
            minimumOrder: 15,
            distance: 1.2,
            image: '/api/placeholder/300/200',
            isOpen: true,
            offers: ['Free Delivery', '20% Off'],
            tags: ['Popular', 'Family Friendly']
        },
        {
            id: '2',
            name: 'Spice Route',
            cuisine: 'Indian',
            rating: 4.6,
            reviewCount: 892,
            deliveryTime: '30-40 min',
            deliveryFee: 0,
            minimumOrder: 20,
            distance: 2.1,
            image: '/api/placeholder/300/200',
            isOpen: true,
            offers: ['Free Delivery'],
            tags: ['Spicy', 'Vegetarian Options']
        },
        {
            id: '3',
            name: 'Burger Barn',
            cuisine: 'American',
            rating: 4.4,
            reviewCount: 567,
            deliveryTime: '20-30 min',
            deliveryFee: 1.99,
            minimumOrder: 10,
            distance: 0.8,
            image: '/api/placeholder/300/200',
            isOpen: false,
            offers: ['15% Off'],
            tags: ['Fast Food', 'Burgers']
        }
    ];

    const cuisines = ['Italian', 'Indian', 'American', 'Chinese', 'Mexican', 'Thai', 'Japanese'];
    const offers = ['Free Delivery', '20% Off', '15% Off', 'Buy 1 Get 1', 'New Customer'];

    useEffect(() => {
        setRestaurants(mockRestaurants);
        setFilteredRestaurants(mockRestaurants);
    }, []);

    useEffect(() => {
        let filtered = restaurants.filter(restaurant => {
            // Search query filter
            if (searchQuery && !restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
                !restaurant.cuisine.toLowerCase().includes(searchQuery.toLowerCase())) {
                return false;
            }

            // Cuisine filter
            if (filters.cuisine.length > 0 && !filters.cuisine.includes(restaurant.cuisine)) {
                return false;
            }

            // Price range filter
            if (filters.priceRange !== 'all') {
                const [min, max] = filters.priceRange.split('-').map(Number);
                if (restaurant.minimumOrder < min || restaurant.minimumOrder > max) {
                    return false;
                }
            }

            // Delivery time filter
            if (filters.deliveryTime !== 'all') {
                const maxTime = parseInt(filters.deliveryTime);
                const restaurantMaxTime = parseInt(restaurant.deliveryTime.split('-')[1]);
                if (restaurantMaxTime > maxTime) {
                    return false;
                }
            }

            // Rating filter
            if (filters.rating > 0 && restaurant.rating < filters.rating) {
                return false;
            }

            // Offers filter
            if (filters.offers.length > 0) {
                const hasMatchingOffer = filters.offers.some(offer =>
                    restaurant.offers.some(restOffer => restOffer.includes(offer))
                );
                if (!hasMatchingOffer) {
                    return false;
                }
            }

            return true;
        });

        // Sort results
        filtered.sort((a, b) => {
            switch (sortBy) {
                case 'rating':
                    return b.rating - a.rating;
                case 'deliveryTime':
                    const aTime = parseInt(a.deliveryTime.split('-')[0]);
                    const bTime = parseInt(b.deliveryTime.split('-')[0]);
                    return aTime - bTime;
                case 'distance':
                    return a.distance - b.distance;
                case 'price':
                    return a.deliveryFee - b.deliveryFee;
                default:
                    return 0;
            }
        });

        setFilteredRestaurants(filtered);
    }, [searchQuery, filters, restaurants, sortBy]);

    const handleFilterChange = (filterType: keyof FilterOptions, value: any) => {
        setFilters(prev => ({
            ...prev,
            [filterType]: value
        }));
    };

    const toggleFavorite = (restaurantId: string) => {
        setFavorites(prev => {
            const newFavorites = new Set(prev);
            if (newFavorites.has(restaurantId)) {
                newFavorites.delete(restaurantId);
            } else {
                newFavorites.add(restaurantId);
            }
            return newFavorites;
        });
    };

    const addToCartAndNavigate = (restaurant: Restaurant) => {
        // Mock adding a popular item to cart
        addToCart({
            id: `${restaurant.id}-item-1`,
            name: 'Popular Item',
            price: 12.99,
            quantity: 1,
            restaurantId: restaurant.id,
            restaurantName: restaurant.name
        });
    };

    return (
        <AuthGuard>
            <div className="min-h-screen bg-background-light">
                {/* Search Header */}
                <div className="bg-white shadow-sm border-b border-border-light">
                    <div className="max-w-6xl mx-auto p-6">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="relative flex-1">
                                <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <Input
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search restaurants, cuisines, or dishes..."
                                    className="pl-10 pr-4 py-3 text-lg"
                                />
                            </div>
                            <Button
                                onClick={() => setShowFilters(!showFilters)}
                                variant="outline"
                                className="flex items-center gap-2"
                            >
                                <Filter size={18} />
                                Filters
                            </Button>
                        </div>

                        {/* Sort Options */}
                        <div className="flex items-center gap-4">
                            <span className="text-sm font-medium text-text-secondary">Sort by:</span>
                            {[
                                { value: 'rating', label: 'Highest Rated' },
                                { value: 'deliveryTime', label: 'Fastest Delivery' },
                                { value: 'distance', label: 'Nearest' },
                                { value: 'price', label: 'Lowest Fee' }
                            ].map(option => (
                                <button
                                    key={option.value}
                                    onClick={() => setSortBy(option.value as any)}
                                    className={`px-3 py-1 rounded-full text-sm transition-colors ${
                                        sortBy === option.value
                                            ? 'bg-primary text-white'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="max-w-6xl mx-auto p-6">
                    <div className="flex gap-8">
                        {/* Filters Sidebar */}
                        {showFilters && (
                            <div className="w-80 flex-shrink-0">
                                <Card className="p-6 sticky top-6">
                                    <h3 className="font-bold text-lg text-primary-dark mb-6">Filters</h3>

                                    {/* Cuisine Filter */}
                                    <div className="mb-6">
                                        <h4 className="font-medium text-primary-dark mb-3">Cuisine</h4>
                                        <div className="grid grid-cols-2 gap-2">
                                            {cuisines.map(cuisine => (
                                                <label key={cuisine} className="flex items-center gap-2 text-sm">
                                                    <input
                                                        type="checkbox"
                                                        checked={filters.cuisine.includes(cuisine)}
                                                        onChange={(e) => {
                                                            const newCuisine = e.target.checked
                                                                ? [...filters.cuisine, cuisine]
                                                                : filters.cuisine.filter(c => c !== cuisine);
                                                            handleFilterChange('cuisine', newCuisine);
                                                        }}
                                                        className="rounded border-border-light"
                                                    />
                                                    {cuisine}
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Price Range */}
                                    <div className="mb-6">
                                        <h4 className="font-medium text-primary-dark mb-3">Minimum Order</h4>
                                        <div className="space-y-2">
                                            {[
                                                { value: 'all', label: 'Any Amount' },
                                                { value: '0-15', label: 'Under $15' },
                                                { value: '15-25', label: '$15 - $25' },
                                                { value: '25-100', label: 'Over $25' }
                                            ].map(option => (
                                                <label key={option.value} className="flex items-center gap-2 text-sm">
                                                    <input
                                                        type="radio"
                                                        name="priceRange"
                                                        value={option.value}
                                                        checked={filters.priceRange === option.value}
                                                        onChange={(e) => handleFilterChange('priceRange', e.target.value)}
                                                        className="text-primary"
                                                    />
                                                    {option.label}
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Delivery Time */}
                                    <div className="mb-6">
                                        <h4 className="font-medium text-primary-dark mb-3">Max Delivery Time</h4>
                                        <div className="space-y-2">
                                            {[
                                                { value: 'all', label: 'Any Time' },
                                                { value: '30', label: 'Under 30 min' },
                                                { value: '45', label: 'Under 45 min' },
                                                { value: '60', label: 'Under 1 hour' }
                                            ].map(option => (
                                                <label key={option.value} className="flex items-center gap-2 text-sm">
                                                    <input
                                                        type="radio"
                                                        name="deliveryTime"
                                                        value={option.value}
                                                        checked={filters.deliveryTime === option.value}
                                                        onChange={(e) => handleFilterChange('deliveryTime', e.target.value)}
                                                        className="text-primary"
                                                    />
                                                    {option.label}
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Rating Filter */}
                                    <div className="mb-6">
                                        <h4 className="font-medium text-primary-dark mb-3">Minimum Rating</h4>
                                        <div className="flex items-center gap-2">
                                            {[0, 3, 4, 4.5].map(rating => (
                                                <button
                                                    key={rating}
                                                    onClick={() => handleFilterChange('rating', rating)}
                                                    className={`px-3 py-1 rounded text-sm ${
                                                        filters.rating === rating
                                                            ? 'bg-primary text-white'
                                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                    }`}
                                                >
                                                    {rating === 0 ? 'Any' : `${rating}+`}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Offers Filter */}
                                    <div className="mb-6">
                                        <h4 className="font-medium text-primary-dark mb-3">Special Offers</h4>
                                        <div className="space-y-2">
                                            {offers.map(offer => (
                                                <label key={offer} className="flex items-center gap-2 text-sm">
                                                    <input
                                                        type="checkbox"
                                                        checked={filters.offers.includes(offer)}
                                                        onChange={(e) => {
                                                            const newOffers = e.target.checked
                                                                ? [...filters.offers, offer]
                                                                : filters.offers.filter(o => o !== offer);
                                                            handleFilterChange('offers', newOffers);
                                                        }}
                                                        className="rounded border-border-light"
                                                    />
                                                    {offer}
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    <Button
                                        onClick={() => setFilters({
                                            cuisine: [],
                                            priceRange: 'all',
                                            deliveryTime: 'all',
                                            rating: 0,
                                            offers: []
                                        })}
                                        variant="outline"
                                        className="w-full"
                                    >
                                        Clear All Filters
                                    </Button>
                                </Card>
                            </div>
                        )}

                        {/* Results */}
                        <div className="flex-1">
                            <div className="mb-4">
                                <p className="text-text-secondary">
                                    {filteredRestaurants.length} restaurants found
                                    {searchQuery && ` for "${searchQuery}"`}
                                </p>
                            </div>

                            <div className="space-y-4">
                                {filteredRestaurants.map(restaurant => (
                                    <Card key={restaurant.id} className="p-6 hover:shadow-lg transition-shadow">
                                        <div className="flex gap-6">
                                            {/* Restaurant Image */}
                                            <div className="w-48 h-32 bg-gray-200 rounded-lg flex items-center justify-center">
                                                <ChefHat size={48} className="text-gray-400" />
                                            </div>

                                            {/* Restaurant Info */}
                                            <div className="flex-1">
                                                <div className="flex items-start justify-between mb-2">
                                                    <div>
                                                        <h3 className="text-xl font-bold text-primary-dark">{restaurant.name}</h3>
                                                        <p className="text-text-secondary">{restaurant.cuisine}</p>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => toggleFavorite(restaurant.id)}
                                                            className={`p-2 rounded-full ${
                                                                favorites.has(restaurant.id)
                                                                    ? 'bg-red-100 text-red-600'
                                                                    : 'bg-gray-100 text-gray-400 hover:text-red-600'
                                                            }`}
                                                        >
                                                            <Heart size={20} fill={favorites.has(restaurant.id) ? 'currentColor' : 'none'} />
                                                        </button>
                                                        {!restaurant.isOpen && (
                                                            <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded">
                                                                Closed
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Rating and Reviews */}
                                                <div className="flex items-center gap-4 mb-3">
                                                    <div className="flex items-center gap-1">
                                                        <Star size={16} className="text-yellow-500 fill-current" />
                                                        <span className="font-medium">{restaurant.rating}</span>
                                                        <span className="text-text-secondary">({restaurant.reviewCount})</span>
                                                    </div>
                                                    <div className="flex items-center gap-1 text-text-secondary">
                                                        <Clock size={14} />
                                                        <span>{restaurant.deliveryTime}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1 text-text-secondary">
                                                        <DollarSign size={14} />
                                                        <span>${restaurant.deliveryFee.toFixed(2)} fee</span>
                                                    </div>
                                                </div>

                                                {/* Tags and Offers */}
                                                <div className="flex flex-wrap gap-2 mb-4">
                                                    {restaurant.tags.map(tag => (
                                                        <span key={tag} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                                            {tag}
                                                        </span>
                                                    ))}
                                                    {restaurant.offers.map(offer => (
                                                        <span key={offer} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                                                            {offer}
                                                        </span>
                                                    ))}
                                                </div>

                                                <div className="flex items-center justify-between">
                                                    <div className="text-sm text-text-secondary">
                                                        <MapPin size={14} className="inline mr-1" />
                                                        {restaurant.distance} miles away • Min. ${restaurant.minimumOrder}
                                                    </div>
                                                    <Button
                                                        onClick={() => addToCartAndNavigate(restaurant)}
                                                        disabled={!restaurant.isOpen}
                                                    >
                                                        <ShoppingCart size={16} className="mr-2" />
                                                        Order Now
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </Card>
                                ))}

                                {filteredRestaurants.length === 0 && (
                                    <div className="text-center py-12">
                                        <Search size={64} className="mx-auto text-gray-300 mb-4" />
                                        <h3 className="text-xl font-medium text-gray-600 mb-2">No restaurants found</h3>
                                        <p className="text-gray-500">Try adjusting your filters or search terms</p>
                                        <Button
                                            onClick={() => {
                                                setSearchQuery('');
                                                setFilters({
                                                    cuisine: [],
                                                    priceRange: 'all',
                                                    deliveryTime: 'all',
                                                    rating: 0,
                                                    offers: []
                                                });
                                            }}
                                            className="mt-4"
                                        >
                                            Clear Filters
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthGuard>
    );
}

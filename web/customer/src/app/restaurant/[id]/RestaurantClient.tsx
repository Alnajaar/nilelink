'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft, Star, Clock, MapPin, Info, Heart, Share2,
    ShoppingCart, Plus, Minus, Search, DollarSign, Utensils, CheckCircle, Loader
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import graphService from '@shared/services/GraphService';
import ipfsService from '@shared/services/IPFSService';
import web3Service from '@shared/services/Web3Service';
import { useAuth } from '@shared/contexts/AuthContext';
import { useRouter } from 'next/navigation';

interface MenuItem {
    id: string;
    name: string;
    description: string;
    price: number;
    image: string;
    category: string;
    isAvailable: boolean;
    isPopular: boolean;
    customizations?: string[];
}

interface Restaurant {
    id: string;
    name: string;
    cuisine: string;
    rating: number;
    reviews: number;
    deliveryTime: string;
    deliveryFee: number;
    minOrder: number;
    image: string;
    isOpen: boolean;
    address: string;
    phone: string;
    hours: string;
    description: string;
    menu: MenuItem[];
}

const MOCK_RESTAURANT = {
    id: 'mock-1',
    name: 'The Golden Plate Restaurant',
    cuisine: 'Mediterranean',
    rating: 4.8,
    reviews: 342,
    deliveryTime: '25-35 min',
    deliveryFee: 2.99,
    minOrder: 15.00,
    image: '/api/placeholder/1200/400',
    isOpen: true,
    address: '123 Main Street, Downtown',
    phone: '+971 50 123 4567',
    hours: 'Mon-Sun: 10:00 AM - 11:00 PM',
    description: 'Authentic Mediterranean cuisine featuring fresh ingredients and traditional recipes passed down through generations.',
    menu: [
        {
            id: '1',
            name: 'Grilled Salmon',
            description: 'Fresh Atlantic salmon with herbs and lemon butter sauce',
            price: 28.99,
            image: '/api/placeholder/300/200',
            category: 'Main Courses',
            isAvailable: true,
            isPopular: true
        },
        {
            id: '2',
            name: 'Mediterranean Mezze Platter',
            description: 'Hummus, baba ganoush, falafel, and fresh pita bread',
            price: 18.99,
            image: '/api/placeholder/300/200',
            category: 'Appetizers',
            isAvailable: true,
            isPopular: true
        }
    ]
};

export default function RestaurantClient({ restaurantId }: { restaurantId: string }) {
    const router = useRouter();
    const { user } = useAuth();

    const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [selectedCategory, setSelectedCategory] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [cart, setCart] = useState<{ [key: string]: number }>({});
    const [placingOrder, setPlacingOrder] = useState(false);

    useEffect(() => {
        const fetchRestaurant = async () => {
            try {
                setLoading(true);
                // 1. Fetch restaurant from The Graph
                const graphData = await graphService.getRestaurantById(restaurantId);
                const restaurantNode = graphData?.restaurant;

                if (restaurantNode) {
                    // 2. Fetch metadata (info) from IPFS
                    let metadata: any = {};
                    if (restaurantNode.metadataCid) {
                        metadata = await ipfsService.getJSONContent(restaurantNode.metadataCid) || {};
                    }

                    // 3. Fetch catalog (menu) from IPFS
                    let menu: any[] = [];
                    if (restaurantNode.catalogCid) {
                        const catalog = await ipfsService.getJSONContent(restaurantNode.catalogCid);
                        menu = catalog?.items || [];
                    }

                    setRestaurant({
                        id: restaurantNode.id,
                        name: metadata.name || 'Unnamed Restaurant',
                        cuisine: metadata.cuisine || 'Various',
                        rating: restaurantNode.rating || 0,
                        reviews: restaurantNode.reviewCount || 0,
                        deliveryTime: metadata.deliveryTime || '30-45 min',
                        deliveryFee: metadata.deliveryFee || 0,
                        minOrder: metadata.minOrder || 0,
                        image: metadata.image || '/api/placeholder/1200/400',
                        isOpen: restaurantNode.status === 'ACTIVE',
                        address: metadata.address || 'Address on-chain',
                        phone: metadata.phone || '',
                        hours: metadata.hours || 'Mon-Sun: 10:00 AM - 10:00 PM',
                        description: metadata.description || '',
                        menu: menu
                    });
                } else {
                    setError('Restaurant not found on-chain');
                    setRestaurant(MOCK_RESTAURANT); // Fallback for dev/demo if not in subgraph
                }
            } catch (err) {
                console.error('Failed to load decentralized restaurant:', err);
                setError('Failed to load restaurant from protocol');
                setRestaurant(MOCK_RESTAURANT);
            } finally {
                setLoading(false);
            }
        };

        fetchRestaurant();
    }, [restaurantId]);

    const menuCategories = restaurant ? ['All', ...Array.from(new Set(restaurant.menu.map(i => i.category || 'Main')))] : [];

    const filteredItems = restaurant?.menu.filter(item => {
        const itemCategory = item.category || 'Main';
        const matchesCategory = selectedCategory === 'all' ||
            itemCategory.toLowerCase() === selectedCategory.toLowerCase() ||
            selectedCategory === 'All';
        const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchesCategory && matchesSearch;
    }) || [];

    const addToCart = (itemId: string) => {
        setCart(prev => ({
            ...prev,
            [itemId]: (prev[itemId] || 0) + 1
        }));
    };

    const removeFromCart = (itemId: string) => {
        setCart(prev => {
            const newCart = { ...prev };
            if (newCart[itemId] > 1) {
                newCart[itemId]--;
            } else {
                delete newCart[itemId];
            }
            return newCart;
        });
    };

    const getCartTotal = () => {
        if (!restaurant) return 0;
        return Object.entries(cart).reduce((total, [itemId, quantity]) => {
            const item = restaurant.menu.find(i => i.id === itemId);
            return total + (Number(item?.price) || 0) * quantity;
        }, 0);
    };

    const getCartItemsCount = () => {
        return Object.values(cart).reduce((sum, qty) => sum + qty, 0);
    };

    const handlePlaceOrder = async () => {
        if (!restaurant) return;
        if (!user) {
            router.push('/login?redirect=/restaurant/' + restaurant.id);
            return;
        }

        setPlacingOrder(true);
        try {
            const orderItems = Object.entries(cart).map(([itemId, quantity]) => ({
                menuItemId: itemId,
                quantity,
                specialInstructions: ''
            }));

            // Calculate total on-chain
            const total = (getCartTotal() + (restaurant?.deliveryFee || 0)).toString();

            // Create order on smart contract
            const orderId = await web3Service.createOrder({
                restaurantId: restaurant.id,
                items: orderItems,
                totalAmount: total,
                deliveryAddress: restaurant.address // In a real app, this would be user's address
            });

            if (orderId) {
                router.push('/order-confirmation?orderId=' + orderId);
            } else {
                alert('On-chain order creation failed. Please check your wallet.');
            }

        } catch (err) {
            console.error('Decentralized order placement error:', err);
            alert('An error occurred while anchoring your order to the blockchain.');
        } finally {
            setPlacingOrder(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <Loader className="w-10 h-10 text-blue-500 animate-spin" />
            </div>
        );
    }

    if (error || !restaurant) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
                <div className="text-center">
                    <Utensils className="w-16 h-16 mx-auto mb-4 text-slate-700" />
                    <h2 className="text-xl font-bold mb-2">Restaurant Not Found</h2>
                    <p className="text-slate-400 mb-6">{error || "We couldn't find the restaurant you're looking for."}</p>
                    <Link href="/restaurants" className="px-6 py-2 bg-blue-600 rounded-lg font-bold">Browse Restaurants</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 pb-20">
            <div className="relative h-64">
                <Image
                    src={restaurant.image}
                    alt={restaurant.name}
                    fill
                    className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 to-transparent" />
                <Link
                    href="/restaurants"
                    className="absolute top-6 left-6 p-3 bg-slate-900/90 hover:bg-slate-900 text-white rounded-full transition"
                >
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div className="absolute top-6 right-6 flex gap-2">
                    <button className="p-3 bg-slate-900/90 hover:bg-slate-900 text-white rounded-full transition">
                        <Heart className="w-5 h-5" />
                    </button>
                    <button className="p-3 bg-slate-900/90 hover:bg-slate-900 text-white rounded-full transition">
                        <Share2 className="w-5 h-5" />
                    </button>
                </div>
            </div>

            <div className="max-w-7xl mx-auto p-6">
                <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800/50 rounded-2xl p-6 mb-8 -mt-20 relative z-10">
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                            <h1 className="text-3xl font-bold text-white mb-2">{restaurant.name}</h1>
                            <p className="text-slate-400 mb-3">{restaurant.cuisine} • {restaurant.description}</p>
                            <div className="flex flex-wrap items-center gap-4 text-sm">
                                <div className="flex items-center gap-1 text-yellow-400">
                                    <Star className="w-4 h-4 fill-yellow-400" />
                                    <span className="font-medium">{restaurant.rating}</span>
                                    <span className="text-slate-500">({restaurant.reviews} reviews)</span>
                                </div>
                                <div className="flex items-center gap-1 text-slate-400">
                                    <Clock className="w-4 h-4" />
                                    {restaurant.deliveryTime}
                                </div>
                                <div className="flex items-center gap-1 text-slate-400">
                                    <DollarSign className="w-4 h-4" />
                                    ${restaurant.deliveryFee} delivery
                                </div>
                                <div className="flex items-center gap-1 text-slate-400">
                                    <MapPin className="w-4 h-4" />
                                    {restaurant.address}
                                </div>
                            </div>
                        </div>
                        <div className={`px-4 py-2 rounded-lg ${restaurant.isOpen ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                            {restaurant.isOpen ? 'Open Now' : 'Closed'}
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-400 pt-4 border-t border-slate-800">
                        <Info className="w-4 h-4" />
                        <span>{restaurant.hours}</span>
                    </div>
                </div>

                <div className="mb-8">
                    <div className="relative mb-4">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search menu..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-slate-900/50 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-2">
                        {menuCategories.map((category) => (
                            <button
                                key={category}
                                onClick={() => setSelectedCategory(category.toLowerCase())}
                                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition ${selectedCategory === category.toLowerCase() || (selectedCategory === 'all' && category === 'All')
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800'
                                    }`}
                            >
                                {category}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-24">
                    {filteredItems.map((item, index) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="bg-slate-900/50 backdrop-blur-sm border border-slate-800/50 rounded-2xl overflow-hidden hover:bg-slate-900/70 transition"
                        >
                            <div className="relative h-48">
                                <Image
                                    src={item.image || '/api/placeholder/400/300'}
                                    alt={item.name}
                                    fill
                                    className="object-cover"
                                />
                                {item.isPopular && (
                                    <div className="absolute top-3 left-3 px-3 py-1 bg-orange-500 text-white rounded-full text-xs font-bold flex items-center gap-1">
                                        <Utensils className="w-3 h-3" />
                                        Popular
                                    </div>
                                )}
                            </div>
                            <div className="p-4">
                                <h3 className="text-lg font-bold text-white mb-1">{item.name}</h3>
                                <p className="text-sm text-slate-400 mb-3 line-clamp-2">{item.description}</p>
                                <div className="flex items-center justify-between">
                                    <span className="text-2xl font-bold text-white">${Number(item.price).toFixed(2)}</span>
                                    {cart[item.id] ? (
                                        <div className="flex items-center gap-3 bg-blue-600 rounded-lg p-1">
                                            <button
                                                onClick={() => removeFromCart(item.id)}
                                                className="p-2 hover:bg-blue-700 rounded transition"
                                            >
                                                <Minus className="w-4 h-4 text-white" />
                                            </button>
                                            <span className="text-white font-bold min-w-[20px] text-center">{cart[item.id]}</span>
                                            <button
                                                onClick={() => addToCart(item.id)}
                                                className="p-2 hover:bg-blue-700 rounded transition"
                                            >
                                                <Plus className="w-4 h-4 text-white" />
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => addToCart(item.id)}
                                            disabled={!item.isAvailable}
                                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg font-medium transition flex items-center gap-2"
                                        >
                                            <Plus className="w-4 h-4" />
                                            Add
                                        </button>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {getCartItemsCount() > 0 && (
                    <motion.div
                        initial={{ y: 100 }}
                        animate={{ y: 0 }}
                        className="fixed bottom-6 left-0 right-0 px-6 z-50"
                    >
                        <div className="max-w-4xl mx-auto">
                            <button
                                onClick={handlePlaceOrder}
                                disabled={placingOrder}
                                className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-2xl p-6 shadow-2xl transition flex items-center justify-between disabled:opacity-75 disabled:cursor-not-allowed"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                                        {placingOrder ? <Loader className="w-5 h-5 animate-spin" /> : <ShoppingCart className="w-5 h-5" />}
                                    </div>
                                    <div className="text-left">
                                        <div className="text-sm opacity-90">{getCartItemsCount()} items</div>
                                        <div className="text-lg font-bold">{placingOrder ? 'Placing Order...' : 'Place Order'}</div>
                                    </div>
                                </div>
                                <div className="text-2xl font-bold">${(getCartTotal() + (restaurant?.deliveryFee || 0)).toFixed(2)}</div>
                            </button>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
}

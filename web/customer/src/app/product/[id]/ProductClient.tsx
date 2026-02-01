'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    ShoppingCart, Heart, Share2, Star, Truck, Shield,
    CheckCircle, Clock, Package, ArrowLeft, Plus, Minus, Zap
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface ProductClientProps {
    productId: string;
}

export default function ProductClient({ productId }: ProductClientProps) {
    const [quantity, setQuantity] = useState(1);
    const [selectedImage, setSelectedImage] = useState(0);
    const [isWishlisted, setIsWishlisted] = useState(false);

    // Mock product data - in a real app this might come from props or a fetch
    const product = {
        id: productId,
        name: 'Premium Organic Extra Virgin Olive Oil',
        price: 24.99,
        originalPrice: 32.99,
        rating: 4.7,
        reviews: 342,
        inStock: true,
        stockCount: 87,
        supplier: {
            name: 'Mediterranean Imports Co.',
            rating: 4.9,
            verified: true
        },
        images: [
            '/api/placeholder/600/600',
            '/api/placeholder/600/600',
            '/api/placeholder/600/600'
        ],
        description: 'Cold-pressed from hand-picked olives from the hills of Tuscany. Rich, fruity flavor with peppery finish. Perfect for salads, dipping, and finishing dishes.',
        features: [
            'Cold-pressed extra virgin quality',
            'Single estate, traceable origin',
            'Dark glass bottle protects freshness',
            'No additives or preservatives',
            'BPA-free packaging'
        ],
        specifications: {
            volume: '500ml',
            origin: 'Italy',
            certification: 'Organic, PDO',
            shelf_life: '18 months',
            storage: 'Cool, dark place'
        },
        deliveryEstimate: '2-3 days',
        freeShipping: true
    };

    const handleAddToCart = () => {
        console.log(`Added ${quantity} to cart`);
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
            <div className="max-w-7xl mx-auto p-6">
                <Link
                    href="/shop"
                    className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition mb-6"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Shop
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                    <div>
                        <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800/50 rounded-2xl p-6 mb-4">
                            <Image
                                src={product.images[selectedImage]}
                                alt={product.name}
                                width={600}
                                height={600}
                                className="w-full h-auto rounded-xl"
                            />
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            {product.images.map((img, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setSelectedImage(idx)}
                                    className={`bg-slate-900/50 border rounded-xl p-2 transition ${selectedImage === idx
                                        ? 'border-blue-500'
                                        : 'border-slate-800/50 hover:border-slate-700'
                                        }`}
                                >
                                    <Image src={img} alt={`View ${idx + 1}`} width={200} height={200} className="w-full h-auto rounded-lg" />
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800/50 rounded-2xl p-6">
                            <div className="mb-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                        <h1 className="text-3xl font-bold text-white mb-2">{product.name}</h1>
                                        <div className="flex items-center gap-2 text-slate-400">
                                            <span>{product.supplier.name}</span>
                                            {product.supplier.verified && (
                                                <CheckCircle className="w-4 h-4 text-blue-400" />
                                            )}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setIsWishlisted(!isWishlisted)}
                                        className={`p-2 rounded-lg transition ${isWishlisted
                                            ? 'bg-red-500/20 text-red-400'
                                            : 'bg-slate-800 text-slate-400 hover:text-red-400'
                                            }`}
                                    >
                                        <Heart className={`w-6 h-6 ${isWishlisted ? 'fill-current' : ''}`} />
                                    </button>
                                </div>

                                <div className="flex items-center gap-4 mb-4">
                                    <div className="flex items-center gap-1">
                                        {[...Array(5)].map((_, i) => (
                                            <Star
                                                key={i}
                                                className={`w-5 h-5 ${i < Math.floor(product.rating)
                                                    ? 'text-yellow-400 fill-yellow-400'
                                                    : 'text-slate-600'
                                                    }`}
                                            />
                                        ))}
                                        <span className="text-white font-medium ml-2">{product.rating}</span>
                                    </div>
                                    <span className="text-slate-400">({product.reviews} reviews)</span>
                                </div>

                                <div className="flex items-baseline gap-3 mb-6">
                                    <span className="text-4xl font-bold text-white">${product.price}</span>
                                    <span className="text-xl text-slate-500 line-through">${product.originalPrice}</span>
                                    <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-sm font-medium">
                                        -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                                    </span>
                                </div>

                                <div className="flex items-center gap-2 mb-6">
                                    {product.inStock ? (
                                        <>
                                            <CheckCircle className="w-5 h-5 text-green-400" />
                                            <span className="text-green-400 font-medium">In Stock ({product.stockCount} available)</span>
                                        </>
                                    ) : (
                                        <>
                                            <Clock className="w-5 h-5 text-red-400" />
                                            <span className="text-red-400 font-medium">Out of Stock</span>
                                        </>
                                    )}
                                </div>
                            </div>

                            <div className="mb-6">
                                <label className="block text-sm font-medium text-slate-400 mb-2">Quantity</label>
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center bg-slate-800 rounded-lg">
                                        <button
                                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                            className="p-3 hover:bg-slate-700 rounded-l-lg transition"
                                        >
                                            <Minus className="w-4 h-4 text-white" />
                                        </button>
                                        <span className="px-6 text-white font-medium">{quantity}</span>
                                        <button
                                            onClick={() => setQuantity(Math.min(product.stockCount, quantity + 1))}
                                            className="p-3 hover:bg-slate-700 rounded-r-lg transition"
                                        >
                                            <Plus className="w-4 h-4 text-white" />
                                        </button>
                                    </div>
                                    <span className="text-slate-400">Max: {product.stockCount}</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <button
                                    onClick={handleAddToCart}
                                    disabled={!product.inStock}
                                    className="px-6 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 disabled:from-gray-600 disabled:to-gray-600 text-white rounded-xl font-medium transition flex items-center justify-center gap-2"
                                >
                                    <ShoppingCart className="w-5 h-5" />
                                    Add to Cart
                                </button>
                                <button className="px-6 py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-medium transition flex items-center justify-center gap-2">
                                    <Zap className="w-5 h-5" />
                                    Buy Now
                                </button>
                            </div>

                            <div className="border-t border-slate-800 pt-6 space-y-3">
                                {product.freeShipping && (
                                    <div className="flex items-center gap-3 text-green-400">
                                        <Truck className="w-5 h-5" />
                                        <span>Free Shipping</span>
                                    </div>
                                )}
                                <div className="flex items-center gap-3 text-slate-400">
                                    <Package className="w-5 h-5" />
                                    <span>Delivery in {product.deliveryEstimate}</span>
                                </div>
                                <div className="flex items-center gap-3 text-slate-400">
                                    <Shield className="w-5 h-5" />
                                    <span>100% Authentic Guarantee</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800/50 rounded-2xl p-6 mb-8">
                    <h2 className="text-2xl font-bold text-white mb-4">Product Details</h2>
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-lg font-semibold text-white mb-2">Description</h3>
                            <p className="text-slate-400">{product.description}</p>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-white mb-3">Key Features</h3>
                            <ul className="space-y-2">
                                {product.features.map((feature, idx) => (
                                    <li key={idx} className="flex items-center gap-2 text-slate-400">
                                        <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-white mb-3">Specifications</h3>
                            <div className="grid grid-cols-2 gap-4">
                                {Object.entries(product.specifications).map(([key, value]) => (
                                    <div key={key} className="flex justify-between border-b border-slate-800 pb-2">
                                        <span className="text-slate-400 capitalize">{key.replace('_', ' ')}</span>
                                        <span className="text-white font-medium">{value as string}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800/50 rounded-2xl p-6">
                    <h2 className="text-2xl font-bold text-white mb-4">Customer Reviews</h2>
                    <div className="text-center py-8">
                        <p className="text-slate-400">Reviews coming soon!</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

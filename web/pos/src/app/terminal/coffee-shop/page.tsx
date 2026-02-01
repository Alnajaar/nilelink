'use client';

import React, { useState } from 'react';
import { usePOS } from '@/lib/core/POSContext';
import {
    Coffee, Star, Plus, Minus, Trash2, User, Check, CreditCard,
    Flame, Snowflake, Milk, Droplet, Cookie
} from 'lucide-react';

interface DrinkSize {
    id: string;
    name: string;
    price: number;
    multiplier: number;
}

interface Temperature {
    id: string;
    name: string;
    icon: React.ReactNode;
}

interface Milk {
    id: string;
    name: string;
    extraCost: number;
}

interface AddOn {
    id: string;
    name: string;
    cost: number;
}

interface MenuItem {
    id: string;
    name: string;
    basePrice: number;
    category: string;
    isFavorite?: boolean;
}

interface CartItem {
    menuItem: MenuItem;
    size: DrinkSize;
    temperature?: Temperature;
    milk?: Milk;
    addOns: AddOn[];
    quantity: number;
    nameOnCup: string;
    finalPrice: number;
}

export default function CoffeeShopTerminal() {
    const { engines, isInitialized } = usePOS();

    // State
    const [cart, setCart] = useState<CartItem[]>([]);
    const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
    const [selectedSize, setSelectedSize] = useState<DrinkSize | null>(null);
    const [selectedTemp, setSelectedTemp] = useState<Temperature | null>(null);
    const [selectedMilk, setSelectedMilk] = useState<Milk | null>(null);
    const [selectedAddOns, setSelectedAddOns] = useState<AddOn[]>([]);
    const [customerName, setCustomerName] = useState('');
    const [loyaltyPoints, setLoyaltyPoints] = useState(250);

    // Sizes
    const sizes: DrinkSize[] = [
        { id: 'small', name: 'Small (12oz)', price: 0, multiplier: 1.0 },
        { id: 'medium', name: 'Medium (16oz)', price: 0.75, multiplier: 1.15 },
        { id: 'large', name: 'Large (20oz)', price: 1.25, multiplier: 1.25 },
    ];

    // Temperatures
    const temperatures: Temperature[] = [
        { id: 'hot', name: 'Hot', icon: <Flame className="w-5 h-5" /> },
        { id: 'iced', name: 'Iced', icon: <Snowflake className="w-5 h-5" /> },
    ];

    // Milk Options
    const milkOptions: Milk[] = [
        { id: 'whole', name: 'Whole Milk', extraCost: 0 },
        { id: 'skim', name: 'Skim Milk', extraCost: 0 },
        { id: 'almond', name: 'Almond Milk', extraCost: 0.75 },
        { id: 'oat', name: 'Oat Milk', extraCost: 0.75 },
        { id: 'soy', name: 'Soy Milk', extraCost: 0.50 },
        { id: 'coconut', name: 'Coconut Milk', extraCost: 0.75 },
    ];

    // Add-Ons
    const addOns: AddOn[] = [
        { id: 'espresso', name: 'Extra Shot', cost: 0.75 },
        { id: 'vanilla', name: 'Vanilla Syrup', cost: 0.50 },
        { id: 'caramel', name: 'Caramel Syrup', cost: 0.50 },
        { id: 'hazelnut', name: 'Hazelnut Syrup', cost: 0.50 },
        { id: 'whipped', name: 'Whipped Cream', cost: 0.50 },
        { id: 'chocolate', name: 'Chocolate Drizzle', cost: 0.50 },
    ];

    // Menu
    const menu: MenuItem[] = [
        { id: '1', name: 'Latte', basePrice: 4.50, category: 'Coffee', isFavorite: true },
        { id: '2', name: 'Cappuccino', basePrice: 4.25, category: 'Coffee', isFavorite: true },
        { id: '3', name: 'Americano', basePrice: 3.75, category: 'Coffee', isFavorite: true },
        { id: '4', name: 'Espresso', basePrice: 2.50, category: 'Coffee' },
        { id: '5', name: 'Mocha', basePrice: 5.00, category: 'Coffee', isFavorite: true },
        { id: '6', name: 'Macchiato', basePrice: 3.95, category: 'Coffee' },
        { id: '7', name: 'Flat White', basePrice: 4.75, category: 'Coffee' },
        { id: '8', name: 'Cold Brew', basePrice: 4.50, category: 'Cold Drinks' },
        { id: '9', name: 'Frappe', basePrice: 5.50, category: 'Cold Drinks' },
        { id: '10', name: 'Green Tea', basePrice: 3.50, category: 'Tea' },
        { id: '11', name: 'Chai Latte', basePrice: 4.75, category: 'Tea' },
        { id: '12', name: 'Croissant', basePrice: 3.50, category: 'Pastries' },
        { id: '13', name: 'Muffin', basePrice: 3.25, category: 'Pastries' },
    ];

    const favorites = menu.filter(item => item.isFavorite);
    const categories = ['Favorites', 'Coffee', 'Cold Drinks', 'Tea', 'Pastries'];

    const [selectedCategory, setSelectedCategory] = useState('Favorites');

    const filteredMenu = selectedCategory === 'Favorites'
        ? favorites
        : menu.filter(item => item.category === selectedCategory);

    const selectItem = (item: MenuItem) => {
        setSelectedItem(item);
        setSelectedSize(sizes[1]); // Default to medium
        setSelectedTemp(temperatures[0]); // Default to hot
        setSelectedMilk(milkOptions[0]); // Default to whole milk
        setSelectedAddOns([]);
    };

    const toggleAddOn = (addOn: AddOn) => {
        if (selectedAddOns.find(a => a.id === addOn.id)) {
            setSelectedAddOns(selectedAddOns.filter(a => a.id !== addOn.id));
        } else {
            setSelectedAddOns([...selectedAddOns, addOn]);
        }
    };

    const calculateItemPrice = () => {
        if (!selectedItem || !selectedSize) return 0;

        const basePrice = selectedItem.basePrice;
        const sizePrice = selectedSize.price;
        const milkPrice = selectedMilk?.extraCost || 0;
        const addOnsPrice = selectedAddOns.reduce((sum, addOn) => sum + addOn.cost, 0);

        return basePrice + sizePrice + milkPrice + addOnsPrice;
    };

    const addToCart = () => {
        if (!selectedItem || !selectedSize) return;

        const finalPrice = calculateItemPrice();

        setCart([...cart, {
            menuItem: selectedItem,
            size: selectedSize,
            temperature: selectedTemp || undefined,
            milk: selectedMilk || undefined,
            addOns: selectedAddOns,
            quantity: 1,
            nameOnCup: customerName,
            finalPrice
        }]);

        // Reset
        setSelectedItem(null);
        setSelectedSize(null);
        setSelectedTemp(null);
        setSelectedMilk(null);
        setSelectedAddOns([]);
    };

    const updateQuantity = (index: number, delta: number) => {
        const newCart = [...cart];
        newCart[index].quantity += delta;
        if (newCart[index].quantity <= 0) {
            newCart.splice(index, 1);
        }
        setCart(newCart);
    };

    const removeItem = (index: number) => {
        const newCart = [...cart];
        newCart.splice(index, 1);
        setCart(newCart);
    };

    const calculateTotal = () => {
        return cart.reduce((sum, item) => sum + (item.finalPrice * item.quantity), 0);
    };

    const pointsEarned = Math.floor(calculateTotal());

    const processCheckout = () => {
        const total = calculateTotal();
        alert(`Processing payment of $${total.toFixed(2)}\nEarned ${pointsEarned} loyalty points!`);
        setLoyaltyPoints(loyaltyPoints + pointsEarned);
        setCart([]);
        setCustomerName('');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
            <div className="max-w-[1920px] mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                        <div className="p-3 bg-amber-500/20 rounded-xl">
                            <Coffee className="w-8 h-8 text-amber-400" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-white">Coffee Shop Terminal</h1>
                            <p className="text-gray-400">Quick service & customization</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-4">
                        <div className="bg-amber-500/20 px-4 py-2 rounded-lg">
                            <div className="flex items-center space-x-2">
                                <Star className="w-5 h-5 text-amber-400" />
                                <span className="text-white font-semibold">{loyaltyPoints} pts</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left: Menu Selection */}
                    <div className="lg:col-span-2 space-y-4">
                        {/* Customer Name */}
                        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
                            <div className="flex items-center space-x-3">
                                <User className="w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    value={customerName}
                                    onChange={(e) => setCustomerName(e.target.value)}
                                    placeholder="Name on cup..."
                                    className="flex-1 px-4 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-amber-500 focus:outline-none"
                                />
                            </div>
                        </div>

                        {/* Categories */}
                        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
                            <div className="flex space-x-2 overflow-x-auto pb-2">
                                {categories.map(category => (
                                    <button
                                        key={category}
                                        onClick={() => setSelectedCategory(category)}
                                        className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors flex items-center space-x-2 ${selectedCategory === category
                                                ? 'bg-amber-600 text-white'
                                                : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                                            }`}
                                    >
                                        {category === 'Favorites' && <Star className="w-4 h-4" />}
                                        <span>{category}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Menu Items */}
                        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
                            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
                                {filteredMenu.map(item => (
                                    <button
                                        key={item.id}
                                        onClick={() => selectItem(item)}
                                        className={`p-4 rounded-lg border-2 transition-all ${selectedItem?.id === item.id
                                                ? 'border-amber-500 bg-amber-500/20'
                                                : 'border-slate-600 bg-slate-700/50 hover:border-amber-500/50 hover:bg-slate-700'
                                            }`}
                                    >
                                        <div className="text-center">
                                            {item.isFavorite && (
                                                <Star className="w-4 h-4 text-amber-400 mx-auto mb-1" fill="currentColor" />
                                            )}
                                            <p className="font-semibold text-white text-sm mb-1">{item.name}</p>
                                            <p className="text-lg font-bold text-amber-400">${item.basePrice.toFixed(2)}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Customization */}
                        {selectedItem && (
                            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 space-y-4">
                                <h3 className="text-lg font-semibold text-white">Customize: {selectedItem.name}</h3>

                                {/* Size */}
                                <div>
                                    <p className="text-sm text-gray-400 mb-2">Size:</p>
                                    <div className="grid grid-cols-3 gap-2">
                                        {sizes.map(size => (
                                            <button
                                                key={size.id}
                                                onClick={() => setSelectedSize(size)}
                                                className={`p-3 rounded-lg border-2 transition-all ${selectedSize?.id === size.id
                                                        ? 'border-amber-500 bg-amber-500/20'
                                                        : 'border-slate-600 bg-slate-700/50 hover:bg-slate-700'
                                                    }`}
                                            >
                                                <p className="text-white font-semibold text-sm">{size.name.split(' ')[0]}</p>
                                                <p className="text-xs text-gray-400">
                                                    {size.price > 0 ? `+$${size.price.toFixed(2)}` : 'Base'}
                                                </p>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Temperature */}
                                <div>
                                    <p className="text-sm text-gray-400 mb-2">Temperature:</p>
                                    <div className="grid grid-cols-2 gap-2">
                                        {temperatures.map(temp => (
                                            <button
                                                key={temp.id}
                                                onClick={() => setSelectedTemp(temp)}
                                                className={`p-3 rounded-lg border-2 transition-all flex items-center justify-center space-x-2 ${selectedTemp?.id === temp.id
                                                        ? 'border-amber-500 bg-amber-500/20'
                                                        : 'border-slate-600 bg-slate-700/50 hover:bg-slate-700'
                                                    }`}
                                            >
                                                {temp.icon}
                                                <span className="text-white font-semibold">{temp.name}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Milk */}
                                <div>
                                    <p className="text-sm text-gray-400 mb-2">Milk:</p>
                                    <div className="grid grid-cols-3 gap-2">
                                        {milkOptions.map(milk => (
                                            <button
                                                key={milk.id}
                                                onClick={() => setSelectedMilk(milk)}
                                                className={`p-2 rounded-lg border-2 transition-all ${selectedMilk?.id === milk.id
                                                        ? 'border-amber-500 bg-amber-500/20'
                                                        : 'border-slate-600 bg-slate-700/50 hover:bg-slate-700'
                                                    }`}
                                            >
                                                <p className="text-white text-sm">{milk.name}</p>
                                                <p className="text-xs text-gray-400">
                                                    {milk.extraCost > 0 ? `+$${milk.extraCost.toFixed(2)}` : 'Free'}
                                                </p>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Add-Ons */}
                                <div>
                                    <p className="text-sm text-gray-400 mb-2">Add-Ons:</p>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                        {addOns.map(addOn => (
                                            <button
                                                key={addOn.id}
                                                onClick={() => toggleAddOn(addOn)}
                                                className={`p-2 rounded-lg border-2 transition-all ${selectedAddOns.find(a => a.id === addOn.id)
                                                        ? 'border-amber-500 bg-amber-500/20'
                                                        : 'border-slate-600 bg-slate-700/50 hover:bg-slate-700'
                                                    }`}
                                            >
                                                <p className="text-white text-sm">{addOn.name}</p>
                                                <p className="text-xs text-amber-400">+${addOn.cost.toFixed(2)}</p>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Price & Add Button */}
                                <div className="flex items-center justify-between pt-4 border-t border-slate-600">
                                    <div>
                                        <p className="text-sm text-gray-400">Item Price:</p>
                                        <p className="text-2xl font-bold text-amber-400">${calculateItemPrice().toFixed(2)}</p>
                                    </div>
                                    <button
                                        onClick={addToCart}
                                        className="px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors font-semibold flex items-center space-x-2"
                                    >
                                        <Plus className="w-5 h-5" />
                                        <span>Add to Order</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right: Order Cart */}
                    <div className="lg:col-span-1">
                        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 sticky top-4">
                            <h2 className="text-lg font-semibold text-white mb-4 flex items-center justify-between">
                                <span className="flex items-center">
                                    <Coffee className="w-5 h-5 mr-2" />
                                    Order ({cart.length})
                                </span>
                                {cart.length > 0 && (
                                    <button
                                        onClick={() => setCart([])}
                                        className="text-xs text-red-400 hover:text-red-300"
                                    >
                                        Clear
                                    </button>
                                )}
                            </h2>

                            {cart.length === 0 ? (
                                <div className="text-center py-12">
                                    <Cookie className="w-16 h-16 text-gray-600 mx-auto mb-3" />
                                    <p className="text-gray-500">No items yet</p>
                                </div>
                            ) : (
                                <div className="space-y-3 max-h-[600px] overflow-y-auto mb-4">
                                    {cart.map((item, index) => (
                                        <div key={index} className="bg-slate-700/50 rounded-lg p-3">
                                            <div className="flex items-start justify-between mb-2">
                                                <div className="flex-1">
                                                    <p className="font-semibold text-white text-sm">{item.menuItem.name}</p>
                                                    <p className="text-xs text-gray-400">{item.size.name.split(' ')[0]}</p>
                                                    {item.nameOnCup && (
                                                        <p className="text-xs text-amber-400 mt-1">For: {item.nameOnCup}</p>
                                                    )}
                                                </div>
                                                <button
                                                    onClick={() => removeItem(index)}
                                                    className="p-1 text-red-400 hover:bg-red-500/20 rounded"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>

                                            {/* Customizations */}
                                            <div className="text-xs text-gray-400 space-y-1 mb-2">
                                                {item.temperature && <p>• {item.temperature.name}</p>}
                                                {item.milk && <p>• {item.milk.name}</p>}
                                                {item.addOns.map(addOn => (
                                                    <p key={addOn.id}>• {addOn.name}</p>
                                                ))}
                                            </div>

                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-2">
                                                    <button
                                                        onClick={() => updateQuantity(index, -1)}
                                                        className="p-1 bg-slate-600 hover:bg-slate-500 rounded"
                                                    >
                                                        <Minus className="w-3 h-3 text-white" />
                                                    </button>
                                                    <span className="text-white font-semibold w-6 text-center text-sm">
                                                        {item.quantity}
                                                    </span>
                                                    <button
                                                        onClick={() => updateQuantity(index, 1)}
                                                        className="p-1 bg-slate-600 hover:bg-slate-500 rounded"
                                                    >
                                                        <Plus className="w-3 h-3 text-white" />
                                                    </button>
                                                </div>
                                                <p className="text-white font-bold">${(item.finalPrice * item.quantity).toFixed(2)}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {cart.length > 0 && (
                                <>
                                    <div className="border-t border-slate-600 pt-4 space-y-3">
                                        <div className="flex justify-between text-sm text-gray-300">
                                            <span>Items:</span>
                                            <span>{cart.reduce((sum, item) => sum + item.quantity, 0)}</span>
                                        </div>
                                        <div className="flex justify-between text-sm text-gray-300">
                                            <span>Points Earned:</span>
                                            <span className="text-amber-400 font-semibold">+{pointsEarned} pts</span>
                                        </div>
                                        <div className="flex justify-between text-2xl font-bold text-white">
                                            <span>Total:</span>
                                            <span>${calculateTotal().toFixed(2)}</span>
                                        </div>
                                    </div>

                                    <button
                                        onClick={processCheckout}
                                        className="w-full mt-4 flex items-center justify-center space-x-2 px-4 py-4 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-semibold"
                                    >
                                        <Check className="w-5 h-5" />
                                        <span>Complete Order</span>
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

'use client';

import React, { useState, useEffect } from 'react';
import { usePOS } from '@/lib/core/POSContext';
import {
    UtensilsCrossed, Clock, Users, Plus, Minus, Trash2,
    ChefHat, StickyNote, DollarSign, Split, Check, X, Bell
} from 'lucide-react';

interface MenuItem {
    id: string;
    name: string;
    price: number;
    category: string;
    available: boolean;
}

interface CartItem {
    menuItem: MenuItem;
    quantity: number;
    course?: 'appetizer' | 'main' | 'dessert' | 'beverage';
    modifiers: string[];
    kitchenNotes: string;
}

interface Table {
    id: string;
    number: number;
    capacity: number;
    status: 'available' | 'occupied' | 'reserved';
    customerCount?: number;
    serverName?: string;
}

export default function RestaurantTerminal() {
    const { engines, isInitialized } = usePOS();

    // State
    const [selectedTable, setSelectedTable] = useState<Table | null>(null);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [menu, setMenu] = useState<MenuItem[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string>('All');
    const [showModifiers, setShowModifiers] = useState<number | null>(null);
    const [showKitchenNotes, setShowKitchenNotes] = useState<number | null>(null);
    const [showSplitBill, setShowSplitBill] = useState(false);
    const [tipPercentage, setTipPercentage] = useState(0);

    // Mock Tables (replace with real data)
    const tables: Table[] = [
        { id: 't1', number: 1, capacity: 2, status: 'available' },
        { id: 't2', number: 2, capacity: 4, status: 'occupied', customerCount: 3, serverName: 'Alice' },
        { id: 't3', number: 3, capacity: 6, status: 'available' },
        { id: 't4', number: 4, capacity: 2, status: 'reserved' },
        { id: 't5', number: 5, capacity: 4, status: 'available' },
        { id: 't6', number: 6, capacity: 8, status: 'occupied', customerCount: 6, serverName: 'Bob' },
    ];

    // Mock Menu (replace with real product data)
    const menuCategories = ['All', 'Appetizers', 'Main Course', 'Desserts', 'Beverages'];
    const mockMenu: MenuItem[] = [
        { id: '1', name: 'Caesar Salad', price: 12.99, category: 'Appetizers', available: true },
        { id: '2', name: 'Garlic Bread', price: 6.99, category: 'Appetizers', available: true },
        { id: '3', name: 'Grilled Salmon', price: 24.99, category: 'Main Course', available: true },
        { id: '4', name: 'Ribeye Steak', price: 34.99, category: 'Main Course', available: true },
        { id: '5', name: 'Vegetarian Pasta', price: 16.99, category: 'Main Course', available: true },
        { id: '6', name: 'Chocolate Cake', price: 8.99, category: 'Desserts', available: true },
        { id: '7', name: 'Tiramisu', price: 9.99, category: 'Desserts', available: true },
        { id: '8', name: 'Red Wine', price: 12.00, category: 'Beverages', available: true },
        { id: '9', name: 'Sparkling Water', price: 4.00, category: 'Beverages', available: true },
    ];

    useEffect(() => {
        setMenu(mockMenu);
    }, []);

    const filteredMenu = selectedCategory === 'All'
        ? menu
        : menu.filter(item => item.category === selectedCategory);

    const addToCart = (menuItem: MenuItem) => {
        const existingIndex = cart.findIndex(
            item => item.menuItem.id === menuItem.id && item.modifiers.length === 0
        );

        if (existingIndex >= 0) {
            const newCart = [...cart];
            newCart[existingIndex].quantity += 1;
            setCart(newCart);
        } else {
            setCart([...cart, {
                menuItem,
                quantity: 1,
                modifiers: [],
                kitchenNotes: ''
            }]);
        }
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

    const addModifier = (index: number, modifier: string) => {
        const newCart = [...cart];
        if (!newCart[index].modifiers.includes(modifier)) {
            newCart[index].modifiers.push(modifier);
            setCart(newCart);
        }
    };

    const setCourse = (index: number, course: CartItem['course']) => {
        const newCart = [...cart];
        newCart[index].course = course;
        setCart(newCart);
    };

    const setKitchenNote = (index: number, note: string) => {
        const newCart = [...cart];
        newCart[index].kitchenNotes = note;
        setCart(newCart);
    };

    const calculateSubtotal = () => {
        return cart.reduce((sum, item) => sum + (item.menuItem.price * item.quantity), 0);
    };

    const calculateTip = () => {
        return calculateSubtotal() * (tipPercentage / 100);
    };

    const calculateTotal = () => {
        return calculateSubtotal() + calculateTip();
    };

    const sendToKitchen = () => {
        if (!selectedTable) {
            alert('Please select a table first');
            return;
        }

        alert(`Order sent to kitchen for Table ${selectedTable.number}!`);
        // Here you would call orderEngine.createOrder with kitchen status
        setCart([]);
    };

    const processPayment = () => {
        if (!selectedTable) {
            alert('Please select a table first');
            return;
        }

        const total = calculateTotal();
        alert(`Processing payment of $${total.toFixed(2)} for Table ${selectedTable.number}`);
        // Clear cart and update table status
        setCart([]);
        setSelectedTable(null);
        setTipPercentage(0);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
            <div className="max-w-[1920px] mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                        <div className="p-3 bg-orange-500/20 rounded-xl">
                            <UtensilsCrossed className="w-8 h-8 text-orange-400" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-white">Restaurant Terminal</h1>
                            <p className="text-gray-400">Table service & dining management</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-4">
                        <div className="text-right">
                            <p className="text-xs text-gray-500">Current Table</p>
                            <p className="text-xl font-bold text-white">
                                {selectedTable ? `Table ${selectedTable.number}` : 'Not Selected'}
                            </p>
                        </div>
                        <Clock className="w-6 h-6 text-gray-400" />
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left: Table Selection */}
                    <div className="lg:col-span-1 space-y-4">
                        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
                            <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
                                <Users className="w-5 h-5 mr-2" />
                                Tables
                            </h2>
                            <div className="grid grid-cols-2 gap-3">
                                {tables.map(table => (
                                    <button
                                        key={table.id}
                                        onClick={() => setSelectedTable(table)}
                                        className={`p-4 rounded-lg border-2 transition-all ${selectedTable?.id === table.id
                                                ? 'border-orange-500 bg-orange-500/20'
                                                : table.status === 'available'
                                                    ? 'border-green-500/30 bg-green-500/10 hover:bg-green-500/20'
                                                    : table.status === 'occupied'
                                                        ? 'border-red-500/30 bg-red-500/10 hover:bg-red-500/20'
                                                        : 'border-yellow-500/30 bg-yellow-500/10 hover:bg-yellow-500/20'
                                            }`}
                                    >
                                        <div className="text-center">
                                            <p className="text-2xl font-bold text-white">{table.number}</p>
                                            <p className="text-xs text-gray-400">{table.capacity} seats</p>
                                            <p className={`text-xs mt-1 ${table.status === 'available' ? 'text-green-400' :
                                                    table.status === 'occupied' ? 'text-red-400' :
                                                        'text-yellow-400'
                                                }`}>
                                                {table.status}
                                            </p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Order Cart */}
                        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
                            <h2 className="text-lg font-semibold text-white mb-4 flex items-center justify-between">
                                <span className="flex items-center">
                                    <ChefHat className="w-5 h-5 mr-2" />
                                    Order ({cart.length})
                                </span>
                                {cart.length > 0 && (
                                    <button
                                        onClick={() => setCart([])}
                                        className="text-xs text-red-400 hover:text-red-300"
                                    >
                                        Clear All
                                    </button>
                                )}
                            </h2>

                            {cart.length === 0 ? (
                                <p className="text-center text-gray-500 py-8">No items in order</p>
                            ) : (
                                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                                    {cart.map((item, index) => (
                                        <div key={index} className="bg-slate-700/50 rounded-lg p-3">
                                            <div className="flex items-start justify-between mb-2">
                                                <div className="flex-1">
                                                    <p className="font-semibold text-white">{item.menuItem.name}</p>
                                                    <p className="text-xs text-gray-400">${item.menuItem.price.toFixed(2)} each</p>
                                                    {item.course && (
                                                        <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded mt-1 inline-block">
                                                            {item.course}
                                                        </span>
                                                    )}
                                                </div>
                                                <button
                                                    onClick={() => removeItem(index)}
                                                    className="p-1 text-red-400 hover:bg-red-500/20 rounded"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>

                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-2">
                                                    <button
                                                        onClick={() => updateQuantity(index, -1)}
                                                        className="p-1 bg-slate-600 hover:bg-slate-500 rounded"
                                                    >
                                                        <Minus className="w-4 h-4 text-white" />
                                                    </button>
                                                    <span className="text-white font-semibold w-8 text-center">
                                                        {item.quantity}
                                                    </span>
                                                    <button
                                                        onClick={() => updateQuantity(index, 1)}
                                                        className="p-1 bg-slate-600 hover:bg-slate-500 rounded"
                                                    >
                                                        <Plus className="w-4 h-4 text-white" />
                                                    </button>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <button
                                                        onClick={() => setShowModifiers(showModifiers === index ? null : index)}
                                                        className="text-xs px-2 py-1 bg-purple-500/20 text-purple-400 rounded hover:bg-purple-500/30"
                                                    >
                                                        Modifiers
                                                    </button>
                                                    <button
                                                        onClick={() => setShowKitchenNotes(showKitchenNotes === index ? null : index)}
                                                        className="text-xs px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded hover:bg-yellow-500/30"
                                                    >
                                                        <StickyNote className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Modifiers */}
                                            {showModifiers === index && (
                                                <div className="mt-2 pt-2 border-t border-slate-600">
                                                    <p className="text-xs text-gray-400 mb-2">Add Modifiers:</p>
                                                    <div className="flex flex-wrap gap-1">
                                                        {['Extra Cheese', 'No Onions', 'Well Done', 'Medium Rare', 'Gluten Free'].map(mod => (
                                                            <button
                                                                key={mod}
                                                                onClick={() => addModifier(index, mod)}
                                                                className={`text-xs px-2 py-1 rounded ${item.modifiers.includes(mod)
                                                                        ? 'bg-purple-500 text-white'
                                                                        : 'bg-slate-600 text-gray-300 hover:bg-slate-500'
                                                                    }`}
                                                            >
                                                                {mod}
                                                            </button>
                                                        ))}
                                                    </div>
                                                    <p className="text-xs text-gray-400 mt-2 mb-1">Course:</p>
                                                    <div className="flex gap-1">
                                                        {(['appetizer', 'main', 'dessert', 'beverage'] as const).map(course => (
                                                            <button
                                                                key={course}
                                                                onClick={() => setCourse(index, course)}
                                                                className={`text-xs px-2 py-1 rounded capitalize ${item.course === course
                                                                        ? 'bg-blue-500 text-white'
                                                                        : 'bg-slate-600 text-gray-300 hover:bg-slate-500'
                                                                    }`}
                                                            >
                                                                {course}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Kitchen Notes */}
                                            {showKitchenNotes === index && (
                                                <div className="mt-2 pt-2 border-t border-slate-600">
                                                    <textarea
                                                        value={item.kitchenNotes}
                                                        onChange={(e) => setKitchenNote(index, e.target.value)}
                                                        placeholder="Special instructions for kitchen..."
                                                        className="w-full px-2 py-1 bg-slate-600 text-white text-xs rounded border border-slate-500 focus:border-yellow-500 focus:outline-none"
                                                        rows={2}
                                                    />
                                                </div>
                                            )}

                                            {item.modifiers.length > 0 && (
                                                <div className="mt-2 flex flex-wrap gap-1">
                                                    {item.modifiers.map(mod => (
                                                        <span key={mod} className="text-xs bg-purple-500/30 text-purple-300 px-2 py-0.5 rounded">
                                                            {mod}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Totals */}
                            {cart.length > 0 && (
                                <div className="mt-4 pt-4 border-t border-slate-600 space-y-2">
                                    <div className="flex justify-between text-gray-300">
                                        <span>Subtotal:</span>
                                        <span>${calculateSubtotal().toFixed(2)}</span>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-300">Tip:</span>
                                        <div className="flex items-center space-x-2">
                                            {[15, 18, 20, 25].map(pct => (
                                                <button
                                                    key={pct}
                                                    onClick={() => setTipPercentage(pct)}
                                                    className={`text-xs px-2 py-1 rounded ${tipPercentage === pct
                                                            ? 'bg-green-500 text-white'
                                                            : 'bg-slate-600 text-gray-300 hover:bg-slate-500'
                                                        }`}
                                                >
                                                    {pct}%
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {tipPercentage > 0 && (
                                        <div className="flex justify-between text-green-400">
                                            <span>Tip ({tipPercentage}%):</span>
                                            <span>${calculateTip().toFixed(2)}</span>
                                        </div>
                                    )}

                                    <div className="flex justify-between text-xl font-bold text-white pt-2 border-t border-slate-600">
                                        <span>Total:</span>
                                        <span>${calculateTotal().toFixed(2)}</span>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2 mt-4">
                                        <button
                                            onClick={sendToKitchen}
                                            className="flex items-center justify-center space-x-2 px-4 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors"
                                        >
                                            <Bell className="w-5 h-5" />
                                            <span>Send to Kitchen</span>
                                        </button>
                                        <button
                                            onClick={processPayment}
                                            className="flex items-center justify-center space-x-2 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                                        >
                                            <Check className="w-5 h-5" />
                                            <span>Pay Now</span>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right: Menu */}
                    <div className="lg:col-span-2">
                        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
                            <h2 className="text-lg font-semibold text-white mb-4">Menu</h2>

                            {/* Category Filter */}
                            <div className="flex space-x-2 mb-4 flex-wrap gap-2">
                                {menuCategories.map(category => (
                                    <button
                                        key={category}
                                        onClick={() => setSelectedCategory(category)}
                                        className={`px-4 py-2 rounded-lg transition-colors ${selectedCategory === category
                                                ? 'bg-orange-600 text-white'
                                                : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                                            }`}
                                    >
                                        {category}
                                    </button>
                                ))}
                            </div>

                            {/* Menu Items Grid */}
                            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                                {filteredMenu.map(item => (
                                    <button
                                        key={item.id}
                                        onClick={() => addToCart(item)}
                                        disabled={!item.available}
                                        className={`p-4 rounded-lg border-2 transition-all text-left ${item.available
                                                ? 'border-slate-600 bg-slate-700/50 hover:border-orange-500 hover:bg-slate-700'
                                                : 'border-slate-700 bg-slate-800 opacity-50 cursor-not-allowed'
                                            }`}
                                    >
                                        <p className="font-semibold text-white mb-1">{item.name}</p>
                                        <p className="text-xs text-gray-400 mb-2">{item.category}</p>
                                        <p className="text-lg font-bold text-orange-400">${item.price.toFixed(2)}</p>
                                        {!item.available && (
                                            <p className="text-xs text-red-400 mt-1">Out of Stock</p>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

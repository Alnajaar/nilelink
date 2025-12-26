"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
    Plus,
    Minus,
    Trash2,
    CreditCard,
    Banknote,
    Zap,
    Package,
    History,
    Grid,
    Wifi,
    WifiOff,
    Database,
    ArrowLeft
} from 'lucide-react';

import { usePOS } from '@/contexts/POSContext';
import { useAuth } from '@/shared/contexts/AuthContext';
import { restaurantApi, orderApi } from '@/shared/utils/api';
import { EventType, EconomicEvent } from '@/lib/events/types';
import { UniversalHeader } from '@/shared/components/UniversalHeader';
import { Button } from '@/shared/components/Button';
import { Card } from '@/shared/components/Card';
import { Badge } from '@/shared/components/Badge';
import { LedgerBadge } from '@/shared/components/LedgerBadge';

export default function SalesTerminal() {
    const {
        eventEngine,
        localLedger,
        recipeEngine,
        journalEngine,
        reputationEngine,
        isOnline,
        unsyncedCount,
        deviceId,
        branchId
    } = usePOS();

    const router = useRouter();
    const { user, isLoading: authLoading } = useAuth();
    const [cart, setCart] = useState<any[]>([]);
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [menu, setMenu] = useState<any[]>([]);
    const [restaurant, setRestaurant] = useState<any>(null);
    const [isLoadingMenu, setIsLoadingMenu] = useState(true);

    // Fetch restaurant menu from backend
    useEffect(() => {
        if (authLoading) return;

        if (!user) {
            router.push('/auth/login');
            return;
        }

        const fetchMenu = async () => {
            try {
                const { restaurants } = (await restaurantApi.list() as any);
                if (restaurants && restaurants.length > 0) {
                    const firstRestaurant = restaurants[0];
                    setRestaurant(firstRestaurant);
                    setMenu(firstRestaurant.menuItems || []);
                }
            } catch (error) {
                console.error('Failed to fetch menu:', error);
            } finally {
                setIsLoadingMenu(false);
            }
        };

        fetchMenu();
    }, [user, authLoading, router]);

    const categories = ['All', ...Array.from(new Set(menu.map((m: any) => m.category)))];

    const addToCart = (item: any) => {
        const existing = cart.find(i => i.id === item.id);
        if (existing) {
            setCart(cart.map(i => i.id === item.id ? { ...i, qty: i.qty + 1 } : i));
        } else {
            setCart([...cart, { ...item, qty: 1 }]);
        }
    };

    const removeFromCart = (itemId: number) => {
        const existing = cart.find(i => i.id === itemId);
        if (existing && existing.qty > 1) {
            setCart(cart.map(i => i.id === itemId ? { ...i, qty: i.qty - 1 } : i));
        } else {
            setCart(cart.filter(i => i.id !== itemId));
        }
    };

    const total = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);

    const handleCheckout = async (paymentMethod: 'cash' | 'card') => {
        if (cart.length === 0 || !eventEngine || !localLedger) return;

        try {
            const orderId = `ord-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
            const actorId = 'staff-default';

            // 1. Anchor Order Created
            const orderCreated = await eventEngine.createEvent(
                EventType.ORDER_CREATED,
                actorId,
                { orderId, orderType: 'dine-in' }
            );
            await localLedger.insertEvent(orderCreated);
            if (journalEngine) await journalEngine.processEvent(orderCreated);

            // 2. Process Items (Add + Inventory Deduction)
            for (const item of cart) {
                const itemAdded = await eventEngine.createEvent(
                    EventType.ORDER_ITEM_ADDED,
                    actorId,
                    {
                        orderId,
                        menuItemId: item.id.toString(),
                        menuItemName: item.name,
                        quantity: item.qty,
                        unitPrice: item.price,
                    }
                );
                await localLedger.insertEvent(itemAdded);

                if (recipeEngine) {
                    try {
                        const deductions = recipeEngine.deductForSale(item.id.toString(), item.qty, branchId);
                        for (const d of deductions) {
                            const invEvent = await eventEngine.createEvent(
                                EventType.INVENTORY_DEDUCTED,
                                actorId,
                                {
                                    ingredientId: d.ingredientId,
                                    ingredientName: d.ingredientName,
                                    quantity: d.deducted,
                                    unit: d.unit as any,
                                    reason: 'sale',
                                    relatedOrderId: orderId
                                }
                            );
                            await localLedger.insertEvent(invEvent);
                            if (journalEngine) await journalEngine.processEvent(invEvent);
                        }
                    } catch (e) {
                        console.warn(`No recipe found for ${item.name}, skipping inventory anchor.`);
                    }
                }
            }

            // 3. Anchor Payment
            const finalEventType = paymentMethod === 'cash' ? EventType.PAYMENT_COLLECTED_CASH : EventType.PAYMENT_COLLECTED_CARD;
            const paymentPayload: any = {
                orderId,
                amount: total,
                currency: 'USD',
            };

            if (paymentMethod === 'cash') {
                paymentPayload.amountTendered = total;
                paymentPayload.changeGiven = 0;
                paymentPayload.cashierId = actorId;
            } else {
                paymentPayload.cardType = 'visa';
                paymentPayload.last4Digits = '4242';
                paymentPayload.transactionId = `tx-${Date.now()}`;
                paymentPayload.providerFee = total * 0.02;
            }

            const paymentEvent = await eventEngine.createEvent(
                finalEventType,
                actorId,
                paymentPayload
            );
            await localLedger.insertEvent(paymentEvent);
            if (journalEngine) await journalEngine.processEvent(paymentEvent);

            setCart([]);
            alert('Protocol Anchored: Order Settlement Complete');
        } catch (error) {
            console.error('Checkout failed', error);
            alert('Protocol Error: Could not anchor event.');
        }
    };

    return (
        <div className="h-screen flex flex-col bg-background-light">
            {/* Trust Header */}
            <UniversalHeader
                appName="POS"
                user={{ name: 'Staff Member', role: 'Cashier' }}
                status={isOnline ? 'online' : 'offline'}
                onLogout={() => console.log('Logout')}
            />

            <main className="flex-1 flex overflow-hidden">
                {/* Product Area */}
                <div className="flex-1 flex flex-col p-6 overflow-hidden">
                    {/* Categories */}
                    <div className="flex gap-3 mb-6 overflow-x-auto pb-2">
                        {categories.map((cat) => (
                            <Button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                variant={selectedCategory === cat ? 'primary' : 'outline'}
                                size="sm"
                                className="whitespace-nowrap"
                            >
                                {cat}
                            </Button>
                        ))}
                    </div>

                    {/* Menu Grid */}
                    <div className="flex-1 overflow-y-auto">
                        <motion.div
                            layout
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
                        >
                            {menu.filter(m => selectedCategory === 'All' || m.category === selectedCategory).map((item, i) => (
                                <motion.div
                                    key={item.id}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: i * 0.05 }}
                                    onClick={() => addToCart(item)}
                                    className="cursor-pointer group transition-all hover:-translate-y-1"
                                >
                                    <Card className="h-full border-border-light group-hover:border-primary-dark group-hover:shadow-lg transition-all">
                                        <div className="w-12 h-12 rounded-lg bg-primary-dark bg-opacity-10 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
                                            {item.icon}
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-primary-dark group-hover:text-primary-light transition-colors">{item.name}</h3>
                                            <p className="text-xs text-text-secondary uppercase tracking-wide mt-1">{item.category}</p>
                                        </div>
                                        <div className="mt-4 flex justify-between items-center">
                                            <span className="text-lg font-bold text-primary-dark">${item.price.toFixed(2)}</span>
                                            <div className="w-8 h-8 rounded-lg bg-primary-dark bg-opacity-10 flex items-center justify-center text-primary-dark opacity-0 group-hover:opacity-100 transition-all">
                                                <Plus size={16} />
                                            </div>
                                        </div>
                                    </Card>
                                </motion.div>
                            ))}
                        </motion.div>
                    </div>
                </div>

                {/* Cart Area */}
                <div className="w-96 bg-background-white border-l border-border-light flex flex-col overflow-hidden">
                    <div className="p-6 flex flex-col h-full">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-primary-dark">Current Order</h2>
                            <Button
                                onClick={() => setCart([])}
                                variant="ghost"
                                size="sm"
                                className="text-text-secondary hover:text-error-default h-auto p-0"
                            >
                                Clear
                            </Button>
                        </div>

                        <div className="flex-1 overflow-y-auto space-y-4">
                            {cart.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center py-12">
                                    <Package className="text-text-disabled mb-4" size={48} />
                                    <p className="text-text-secondary">No items in cart</p>
                                </div>
                            ) : (
                                cart.map((item, i) => (
                                    <motion.div
                                        key={item.id}
                                        initial={{ x: 20, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        className="flex items-center gap-4 p-4 bg-background-light rounded-lg border border-border-light"
                                    >
                                        <div className="w-10 h-10 rounded-lg bg-primary-dark bg-opacity-10 flex items-center justify-center text-xl">
                                            {item.icon}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-medium text-primary-dark truncate">{item.name}</h4>
                                            <p className="text-sm text-text-secondary">${item.price.toFixed(2)}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                onClick={() => removeFromCart(item.id)}
                                                variant="outline"
                                                size="sm"
                                                className="w-8 h-8 p-0 hover:bg-error-default hover:text-background-light hover:border-error-default"
                                            >
                                                <Minus size={12} />
                                            </Button>
                                            <span className="w-6 text-center font-medium">{item.qty}</span>
                                            <Button
                                                onClick={() => addToCart(item)}
                                                variant="outline"
                                                size="sm"
                                                className="w-8 h-8 p-0 hover:bg-success-default hover:text-background-light hover:border-success-default"
                                            >
                                                <Plus size={12} />
                                            </Button>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </div>

                        <div className="mt-6 space-y-4">
                            <div className="space-y-2 pt-4 border-t border-border-light">
                                <div className="flex justify-between text-sm text-text-secondary">
                                    <span>Subtotal</span>
                                    <span>${total.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-em text-text-secondary items-center">
                                    <span>Protocol Fee</span>
                                    <div className="flex items-center gap-2">
                                        <LedgerBadge verified={true} />
                                        <span>$0.00</span>
                                    </div>
                                </div>
                                <div className="flex justify-between text-xl font-bold text-primary-dark pt-2">
                                    <span>Total</span>
                                    <span>${total.toFixed(2)}</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <Button
                                    onClick={() => handleCheckout('cash')}
                                    disabled={cart.length === 0}
                                    className="h-16 flex-col gap-1"
                                >
                                    <Banknote size={20} />
                                    <span className="text-xs">Cash</span>
                                </Button>
                                <Button
                                    onClick={() => handleCheckout('card')}
                                    disabled={cart.length === 0}
                                    variant="outline"
                                    className="h-16 flex-col gap-1 border-2"
                                >
                                    <CreditCard size={20} />
                                    <span className="text-xs">Card</span>
                                </Button>
                            </div>

                            <Button
                                onClick={() => handleCheckout('card')}
                                disabled={cart.length === 0}
                                className="w-full h-12 bg-success-default hover:bg-success-light"
                            >
                                <Zap size={16} />
                                Complete Transaction
                            </Button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

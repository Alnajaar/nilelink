"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface CartItem {
    id: string;
    name: string;
    price: number;
    quantity: number;
    image?: string;
    restaurantId: string;
    restaurantName: string;
    specialInstructions?: string;
}

interface CustomerContextType {
    cart: CartItem[];
    addToCart: (item: CartItem) => void;
    removeFromCart: (itemId: string) => void;
    updateQuantity: (itemId: string, quantity: number) => void;
    clearCart: () => void;
    cartTotal: number;
    cartCount: number;
    activeOrderId: string | null;
    setActiveOrderId: (id: string | null) => void;
    location: { lat: number; lng: number; address: string } | null;
    setLocation: (location: { lat: number; lng: number; address: string } | null) => void;
    user: { id: string; name: string; email: string } | null;
    setUser: (user: { id: string; name: string; email: string } | null) => void;
}

const CustomerContext = createContext<CustomerContextType | undefined>(undefined);

export const useCustomer = () => {
    const context = useContext(CustomerContext);
    if (!context) {
        throw new Error('useCustomer must be used within CustomerProvider');
    }
    return context;
};

export function CustomerProvider({ children }: { children: React.ReactNode }) {
    const [cart, setCart] = useState<CartItem[]>([]);
    const [activeOrderId, setActiveOrderId] = useState<string | null>(null);
    const [location, setLocation] = useState<{ lat: number; lng: number; address: string } | null>(null);

    // Persist cart to localStorage
    useEffect(() => {
        const savedCart = localStorage.getItem('nilelink_customer_cart');
        const savedLocation = localStorage.getItem('nilelink_customer_location'); // Persist location

        if (savedCart) {
            try {
                setCart(JSON.parse(savedCart));
            } catch (e) {
                console.error('Failed to parse cart', e);
            }
        }
        if (savedLocation) {
            try {
                setLocation(JSON.parse(savedLocation));
            } catch (e) {
                console.error('Failed to parse location', e);
            }
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('nilelink_customer_cart', JSON.stringify(cart));
    }, [cart]);

    useEffect(() => {
        if (location) {
            localStorage.setItem('nilelink_customer_location', JSON.stringify(location));
        }
    }, [location]);

    const addToCart = (item: CartItem) => {
        setCart(prev => {
            const existing = prev.find(i => i.id === item.id);
            if (existing) {
                return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
            }
            return [...prev, { ...item, quantity: 1 }];
        });
    };

    const removeFromCart = (itemId: string) => {
        setCart(prev => {
            const existing = prev.find(i => i.id === itemId);
            if (existing && existing.quantity > 1) {
                return prev.map(i => i.id === itemId ? { ...i, quantity: i.quantity - 1 } : i);
            }
            return prev.filter(i => i.id !== itemId);
        });
    };

    const updateQuantity = (itemId: string, quantity: number) => {
        if (quantity <= 0) {
            removeFromCart(itemId);
            return;
        }
        setCart(prev =>
            prev.map(item =>
                item.id === itemId ? { ...item, quantity } : item
            )
        );
    };

    const clearCart = () => setCart([]);

    const cartTotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

    // TODO: Integrate with AuthContext for real user data
    // import { useAuth } from '@shared/contexts/AuthContext';
    // const { user } = useAuth();
    
    const [user, setUser] = useState<{ id: string; name: string; email: string } | null>(null);
    
    return (
        <CustomerContext.Provider
            value={{
                cart,
                addToCart,
                removeFromCart,
                updateQuantity,
                clearCart,
                cartTotal,
                cartCount,
                activeOrderId,
                setActiveOrderId,
                location,
                setLocation,
                user,
                setUser
            }}
        >
            {children}
        </CustomerContext.Provider>
    );
}
